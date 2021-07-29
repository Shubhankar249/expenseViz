const addT = document.getElementById('add-transaction');
const graph = document.getElementById('graph');

let users = [], edges = [], transactions = [];

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
function getHome() {
    fetch('/home')
        .then(res => res.json())
        .then(res => {
            // console.log(res);
            users = res.users;
            transactions = res.transactions;
            updateTransactions();
        })
        .catch(err => console.error(err));
}
getHome();

function updateTransactions() {
    let transactionList = document.getElementById('tList');
    transactionList.innerHTML = "";
    for (let transaction of transactions) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(`Rs. ${transaction.amt} paid to ${getUserById(transaction.to)} from ${getUserById(transaction.from)} on ${transaction.date}.`));
        transactionList.appendChild(li);
    }

    let {givers, takers} = createHeaps();
    edges = createEdges(givers, takers);
    showGraph();
}

function getUserById(id) {
    for (let i of users)
        if (i._id === id)
            return i.name;
    return "Left Group";
}

function getUserByName(name) {
    for (let i of users) {
        if (i.name === name)
            return i._id;
    }
    return -1;
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
    while (givers.size()) {
        let g = givers.extractRoot(), t = takers.extractRoot();
        let val = Math.min(g.key, t.key);

        edges.push({arrows: {to : {enabled: true}}, color:'orange', from : g.value, to: t.value, label : String(val)});

        g.key -= val;
        t.key -= val;
        if (g.key > 0) givers.insert(g);
        if (t.key > 0) takers.insert(t);
    }
    return edges;
}

addT.onclick = function () {
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;
    let amt = document.getElementById('amount').value;
    let date = document.getElementById('date').value;

    let src = getUserByName(from);
    let dest = getUserByName(to);
    if (src === -1 || dest === -1) {
        alert("You may have mistyped the name of your friend!");
        return;
    }
    postTransaction({from: src, to: dest, amt: amt, date: date});
}

function postTransaction(transaction) {
    fetch('/transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(transaction)
    })
        .then(res=> res.json())
        .then(res => {
            console.log(res);
            users = res.users;
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