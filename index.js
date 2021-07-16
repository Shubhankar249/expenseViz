const addT = document.getElementById('add-transaction');
const graph = document.getElementById('graph');

const persons = ["Shubhankar", "Salik", "Resider", "Mohit", "Om", "Sanskar", "Pawan", "Aayuswa", "Rahul"];
let balance = [], nodes = [], edges = [];

for (let i = 0; i<persons.length; i++) balance.push(0);

// initialize graph options
const options = {
    edges : {
        font: {size: 18},
        color: 'blue'
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
function showGraph() {  // show graph
    let visData = {nodes: nodes, edges: edges};
    network.setData(visData);
}
showGraph();


addT.onclick = function () {
    let transactionList = document.getElementById('tList');
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
    addEdge(src, dest, parseInt(amt));

    let li = document.createElement('li');
    li.appendChild(document.createTextNode(`Rs. ${amt} paid to ${to} from ${from} on ${date}.`));
    transactionList.appendChild(li);
}

function addEdge(src, dest, amt) {
    balance[dest] += amt;
    balance[src] -= amt;

}