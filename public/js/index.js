const addT = document.getElementById('add-transaction');
const graph = document.getElementById('graph');

let users = [], edges = [], transactions = [], curr_user, curr_room;

async function checkingAuth() {
    try {
        const res = await fetch('/get-user');
        if (res.status !== 204) {
            curr_user = await res.json();
            document.getElementById('signed-out').style.display = "none";
            document.getElementById('signed-in').style.display = "block";
            document.getElementById('curr-user-debt').style.display = "block";

            document.getElementById('signed-in-para').innerHTML = `Hey ${curr_user.name}`;
            updateRoomsList();
        }
    } catch (e) {
        console.error(e);
    }
}checkingAuth();

function updateRoomsList() {
    let s = "";
    for (const room of curr_user.rooms)
        s += `<li onclick="getRoom('${room._id}')"><a href="#">${room.name}</a></li>`;
    document.getElementById('room-list').innerHTML = s;
}

document.getElementById('invite-button').onclick = () => navigator.clipboard.writeText(`https://expenseviz.herokuapp.com/join-room/?roomId=${curr_room}`).then(() => alert("copied"));

// initialize graph options
const options = {
    edges : {
        font: {size: 18}
    },
    nodes:{
        fixed: false,
        font: '16px sans-serif black',
        scaling: {
            label: true
        },
        shape : 'icon',
        icon : {
            face : 'FontAwesome',
            code : '\uf29d',
            size : 40,
            color : 'black'
        },
        shadow: true
    }
}

// init network
const network = new vis.Network(graph);
network.setOptions(options);

// get users and transactions lists
function getRoom(e) {
    document.getElementById('invite-text').style.display = "block";
    curr_room = e;

    fetch('/home/'+e)
        .then(res => res.json())
        .then(res => {
            users = res.members;
            transactions = res.transactions;
            updateTransactions();
            createForm();
        })
        .catch(err => console.error(err));
}
// getRoom();

function updateTransactions() {
    // console.log(transactions);
    let s = "";
    for (let i of transactions) {
        let dest = i.to.map(x => " " + getUserById(x));

        dest.join(',');
        s += `<li>Rs. ${i.amt} paid to${dest} from ${getUserById(i.from)} on ${i.date}.</li>`;
    }
    document.getElementById('tList').innerHTML = s;

    let {givers, takers} = createHeaps();
    edges = createEdges(givers, takers);
    showGraph();

    updateUserDebt();
}

function createForm() {
    document.getElementById('new-transaction').style.display = "block";
    let s = "";
    for (let i of users)
        s += `<option value="${i._id}">${i.name}</option>`;
    document.getElementById('from').innerHTML = s;

    s = "";
    for (let i of users)
        s += `<input type="checkbox" id = "to-${i._id}" value="${i._id}"> <label for="to-${i._id}">${i.name}</label>`;
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

        edges.push({arrows: {to : {enabled: true}}, color:'orange', from : g.value, to: t.value, label : String(Math.floor(val))});

        g.key -= val;
        t.key -= val;
        if (g.key > 0) givers.insert(g);
        if (t.key > 0) takers.insert(t);
    }
    return edges;
}

addT.onclick = function () {
    let from = document.getElementById('from').value;
    let to = document.getElementById('to');
    let tos = [];
    for (const t of to.children) {
        if (t.tagName === 'INPUT' && t.checked === true) {
            tos.push(t.value);
        }
    }

    let amt = document.getElementById('amount').value;
    let date = document.getElementById('date').value;

    postTransaction({from: from, to: tos, amt: amt, date: date});
}

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
            s += `<li>Rs. ${i.amt} to ${getUserById(i.to)}.</li>`;
        debtList.innerHTML = s;
    }
}