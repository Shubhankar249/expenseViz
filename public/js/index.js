const addT = document.getElementById('add-transaction');
const graph = document.getElementById('graph');

const persons = ["Shubhankar", "Salik", "Resider", "Mohit", "Om", "Sanskar", "Pawan", "Aayuswa", "Rahul"];
let balance = [], nodes = [], edges = [], transactions = [];


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

// creating nodes
for (let i = 0; i < persons.length; i++) nodes.push({id: i, label: persons[i]});
nodes = new vis.DataSet(nodes);

// init network
const network = new vis.Network(graph);
network.setOptions(options);

// get balance and transaction lists
function getHome() {
    fetch('/home')
        .then(res => res.json())
        .then(res => {
            balance = res.balance;
            transactions = res.transactions;
            updateTransactions();
        })
        .catch(err => console.error(err));
}
getHome();

function updateTransactions() {
    // console.log("showTransactions called");
    let transactionList = document.getElementById('tList');
    transactionList.innerHTML = "";
    for (let transaction of transactions) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(`Rs. ${transaction.amt} paid to ${persons[transaction.to]} from ${persons[transaction.from]} on ${transaction.date}.`));
        transactionList.appendChild(li);
    }

    let {givers, takers} = createHeaps();
    edges = createEdges(givers, takers);
    showGraph();
}

function showGraph() {  // show graph
    let visData = {nodes: nodes, edges: edges};
    network.setData(visData);
}

addT.onclick = function () {
    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;
    let amt = document.getElementById('amount').value;
    let date = document.getElementById('date').value;

    let src = persons.indexOf(from);
    let dest = persons.indexOf(to);
    if (src === -1 || dest === -1) {
        alert("You may have mistyped the name of your friend!");
        return;
    }
    postTransaction({from: src, to: dest, amt: amt, date: date});
}

function postTransaction(transaction) {
    console.log("posting ", transaction);
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
            balance = res.balance;
            transactions = res.transactions;
            updateTransactions();
        })
        .catch(err => console.error(err));
}


function createHeaps() {
    let givers = new MaxHeap();
    let takers = new MaxHeap();

    for (let i=0; i<balance.length; i++) {
        if (balance[i] > 0) takers.insert(balance[i], i);
        if (balance[i] < 0) givers.insert(-balance[i], i);
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