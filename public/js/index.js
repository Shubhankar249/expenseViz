const graph = document.getElementById('graph');
const toggleGraph = document.getElementById('show-transaction-button');

let users = [], edges = [], transactions = [], curr_user, curr_room, isGraphVisible = true;

async function checkingAuth() {
    try {
        const res = await fetch('/get-user');
        if (res.status !== 204) {
            curr_user = await res.json();
            document.getElementById('user-name').innerHTML = curr_user.name;
            updateRoomsList();
        }
    } catch (e) {
        console.error(e);
    }
}checkingAuth();

function updateRoomsList() {
    let s = "";
    for (const room of curr_user.rooms)
        s += `<a id = "${room._id}" class="nav-link" href="#" onclick="getRoom('${room._id}')">${room.name}</a>`;
    document.getElementById('room-list').innerHTML = s;
}

// Copy Invite Link
document.getElementById('invite-button').onclick = () => navigator.clipboard.writeText(`https://expenseviz.herokuapp.com/join-room/?roomId=${curr_room}`).then(() => {});

// Hide graph on mobile devices because of scrolling issue
toggleGraph.onclick = () => {
    graph.style.display = isGraphVisible ? "none" : "block";
    toggleGraph.innerText = isGraphVisible ? "Graph" : "Transactions";
    isGraphVisible = !isGraphVisible;
}

// initialize graph options
const options = {
    edges : {
        font: {size: 22}
    },
    nodes:{
        fixed: false,
        font: '20px arial black',
        scaling: {
            label: true
        },
        shape : 'icon',
        icon : {
            face : 'FontAwesome',
            code : '\uf406',
            size : 28,
            color : 'black'
        }
    }
}

// init network
const network = new vis.Network(graph);
network.setOptions(options);

// get users and transactions lists
function getRoom(e) {
    curr_room = e;
    updateRoomsList();
    document.getElementById('home').style.display = "none";
    document.getElementById(curr_room).className += " active";

    fetch('/home/'+e)
        .then(res => res.json())
        .then(res => {
            document.getElementById('room').style.display = "block";
            document.getElementById('room-helpers').style.display = "block";
            users = res.members;
            transactions = res.transactions;
            updateTransactions();
            createForm();
        })
        .catch(err => console.error(err));
}

function updateTransactions() {
    transactions.sort((a, b) => a.date > b.date ? -1 : 1);

    let s = "";
    for (let i of transactions) {
        let dest = i.to.map(x => " " + getUserById(x));

        dest.join(',');
        let date = new Date(i.date);
        date = date.toDateString();

        s += `<li class="list-group-item" data-bs-toggle="tooltip" data-bs-placement="bottom" title="${date}"><strong>Rs. ${i.amt}:</strong> ${getUserById(i.from)} <i class="fas fa-arrow-right"></i> ${dest}</li>`;
    }
    document.getElementById('tList').innerHTML = s;

    let {givers, takers} = createHeaps();
    edges = createEdges(givers, takers);
    showGraph();

    updateUserDebt();
}

function createForm() {
    let s = "";
    for (let i of users)
        s += `<option value="${i._id}">${i.name}</option>`;
    document.getElementById('from').innerHTML = s;

    s = "";
    for (let i of users)
        s += `<input type="checkbox" class="btn-check" autocomplete="off" id = "to-${i._id}" value="${i._id}"> <label class="btn btn-outline-primary btn-sm m-1" for="to-${i._id}">${i.name}</label>`;
    document.getElementById('to').innerHTML = s;
}

function getUserById(id) {
    for (let i of users)
        if (i._id === id)
            return i.name;
    return "Left Group";
}

function createHeaps() {
    let givers = new MaxHeap();
    let takers = new MaxHeap();

    for (let i of users) {
        if (i.balance > 0) takers.insert(i.balance, i._id);
        if (i.balance < 0) givers.insert(0 - i.balance, i._id);
    }
    return{givers, takers};
}

function createEdges(givers, takers) {
    let edges = [];
    while (givers.size() && takers.size()) {
        let g = givers.extractRoot(), t = takers.extractRoot();
        let val = Math.min(g.key, t.key);

        if (val >= 1) edges.push({arrows: {to : {enabled: true}}, color:'grey', from : g.value, to: t.value, label : String(Math.floor(val))});

        g.key -= val;
        t.key -= val;
        if (g.key > 0) givers.insert(g);
        if (t.key > 0) takers.insert(t);
    }
    return edges;
}

document.getElementById('add-transaction').addEventListener('click', () => {
    let from = document.getElementById('from').value;
    let to = document.getElementById('to');
    let tos = [];
    for (const t of to.children) {
        if (t.tagName === 'INPUT' && t.checked === true) {
            tos.push(t.value);
        }
    }
    if (tos.length === 0) {
        alert('You have not selected a receiver');
        return;
    }

    let amt = document.getElementById('amount').value;
    let date = document.getElementById('date').value;

    postTransaction({from: from, to: tos, amt: amt, date: date});
});

function postTransaction(transaction) {
    const data = {transaction: transaction, roomId: curr_room};
    fetch('/transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    })
        .then(res=> res.json())
        .then(res => {
            // console.log(res);
            users = res.members;
            transactions = res.transactions;
            updateTransactions();
        })
        .catch(err => console.error(err));
}

function showGraph()    {  // show graph
    let nodes = [];
    for (let user of users) nodes.push({id: user._id, label: user.name});
    nodes = new vis.DataSet(nodes);

    const visData = {nodes: nodes, edges: edges};
    network.setData(visData);
}

function updateUserDebt() {
    let debts = [], balance = 0;
    for (let i of edges) {
        if (i.from === curr_user._id) {
            debts.push({to: i.to, amt: i.label});
            balance += parseInt(i.label);
        }
    }
    let userBalance = document.getElementById('user-balance');
    let debtList = document.getElementById('debt-list');

    if (balance === 0) {
        userBalance.innerHTML = "Rs. 0 /- Great!";
        debtList.innerHTML = "";
    }else {
        userBalance.innerHTML = `Rs. ${balance}/- to: `;

        let s = "";
        for (let i of debts)
            s += `<li class="list-group-item">Rs. ${i.amt} to ${getUserById(i.to)}.</li>`;
        debtList.innerHTML = s;
    }
}