var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody().strength(-400).distanceMin(80))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

var root = null;

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

d3.json('data.json').then(function (data) {
    root = d3.hierarchy(data);
    update();
}, function (error) {
    console.error(error);
});

function update() {
        var tree = d3.tree(),
        nodes = flatten(root),
        links = tree(root).links();

    simulation
        .nodes(nodes);
    simulation
        .force("link")
        .links(links)
        .distance(function (d) {
            return 80;
        });
    simulation.alpha(1).restart();

    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter().insert("line",".node").merge(link)
        .attr("class", "link");

    node = node.data(nodes, function(d) { return d.id; });
    node.exit().remove();
    node = node.enter().append("g").merge(node)
        .attr('class', 'node');


    node.filter(function (d) {
        return d.depth === 2;
    }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    node.filter(function(d){return d.depth===0}).on("click", function (d) {
        if (!d3.event.defaultPrevented) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update();
        }
    });
    node.filter(function (d) {
        return d.depth === 1;
    })
        .append("rect")
        .attr("class", function (d) {
            return getClassByLevel(d);
        })
        .attr("width", function (d) {
            return d.data.width;
        });

    node.filter(function (d) {
        return d.depth === 1;
    })
        .append('circle')
        .attr('r', 10)
        .style("fill", '#fff')
        .attr('cx', function (d) {
            return d.data.width - 10 * 2
        })
        .attr('cy', 15)
        .on("click", function (d) {
            if (!d3.event.defaultPrevented) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update();
            }
        });

    node.append("text")
        .text(function (d) {
                return d.data.value;
            }
        ).attr("class", function (d) {
        return getClassByLevel(d);
    })
        .attr('x', 10)
        .attr('y', 20)
        .filter(function (d) {
            return d.depth !== 1;
        })
        .on("mouseover", function (d) {
            d3.select(this).style("fill", 'red')
        })
        .on("mouseout", function (d) {
            d3.select(this).style("fill", "black")
        });
}

function ticked() {
    link
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node
        .attr('transform', function (d) {
            return 'translate(' + (d.x - getLetterOffset(d)) + ',' + (d.y - 15) + ')'
        })
}

function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

function getClassByLevel(d) {
    switch (d.depth) {
        case 0 :
            return 'level0';
        case 1 :
            return 'level1';
        case 2 :
            return 'level2';
        default :
            return 'level2';
    }
}

function getLetterOffset(d) {
    switch (d.depth) {
        case 0 :
            return (d.data.value.length || 1) * 13 / 2;
        case 1 :
            return 100 / 2;
        case 2 :
            return (d.data.value.length || 1) * 13 / 2;
        default :
            return (d.data.value.length || 1) * 13 / 2;
    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(1).restart();
    //simulation.stop();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
