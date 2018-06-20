var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2 - 80) + ")"),
    duration = 500;

var tree = d3.tree()
    .size([2 * Math.PI, 240])
    .separation(function (a, b) {
        return (a.parent === b.parent ? 1 : 2) / a.depth;
    });
var i = 0, root;
d3.json('test.json').then(
    function (data) {
        root = tree(d3.hierarchy(data));
        update(root)
    }, function (error) {
        console.error(error);
    }
);

function update(source) {
    var oldPosX = source.x,
        oldPosY = source.y;
    var nodes = flatten(root),
        links = tree(root).links();
    var link = g.selectAll(".link")
        .data(links, function (d) {
            return d.source.id + '-' + d.target.id;
        });
    var linkEnter = link.enter().insert("line",'g')
        .attr("class", "link")
        .attr("x1", function (d) {
            return radialPoint(oldPosX, oldPosY)[0] + getLetterOffset(d.source)
        })
        .attr("y1", function (d) {
            return radialPoint(oldPosX, oldPosY)[1] + 15
        })
        .attr("x2", function (d) {
            return radialPoint(oldPosX, oldPosY)[0] + getLetterOffset(d.target)
        })
        .attr("y2", function (d) {
            return radialPoint(oldPosX, oldPosY)[1] + 15
        })
        .transition()
        .duration(duration)
        .attr("x1", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.source)
        })
        .attr("y1", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        })
        .attr("x2", function (d) {
            return radialPoint(d.target.x, d.target.y)[0] + getLetterOffset(d.target)
        })
        .attr("y2", function (d) {
            return radialPoint(d.target.x, d.target.y)[1] + 15
        });
    link.transition()
        .duration(duration)
        .attr("x1", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.source)
        })
        .attr("y1", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        })
        .attr("x2", function (d) {
            return radialPoint(d.target.x, d.target.y)[0] + getLetterOffset(d.target)
        })
        .attr("y2", function (d) {
            return radialPoint(d.target.x, d.target.y)[1] + 15
        });

    var lineExit = link.exit()
        .transition()
        .duration(duration)
        .attr("x1", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.source)
        })
        .attr("y1", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        })
        .attr("x2", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.source)
        })
        .attr("y2", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        })
        .remove();

    var node = g.selectAll("g.node")
        .data(nodes, function (d) {
            return d.id;
        });
    var nodeEnter = node.enter().append("g")
        .attr("class", function (d) {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        });
    var level0Node = nodeEnter.filter(function (d) {
        return d.depth === 0;
    });
    level0Node.on("click", click);
    var level1Node = nodeEnter.filter(function (d) {
        return d.depth === 1;
    });
    level1Node.append("rect")
        .attr("class", function (d) {
            return getClassByLevel(d);
        })
        .attr("width", function (d) {
            return d.data.width;
        });
    level1Node.append('circle')
        .attr('r', 10)
        .attr("class", 'fold')
        .attr('cx', function (d) {
            return d.data.width - 10 * 2
        })
        .attr('cy', 15)
        .on("click", click);

    level1Node.append('rect') .attr("class",'symbol');

    nodeEnter.append("text")
        .text(function (d) {
            return d.data.value;
        })
        .attr("class", function (d) {
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

    node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(d.x, d.y) + ')'
        });
    nodeEnter
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(oldPosX, oldPosY) + ')'
        })
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(d.x, d.y) + ')'
        });
    node.exit()
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + radialPoint(source.x, source.y) + ")";
        })
        .remove();
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

function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
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

function click(d) {
    if (!d3.event.defaultPrevented) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}