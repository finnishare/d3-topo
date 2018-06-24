var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2 - 20) + ")"),
    duration = 500;

var tree = d3.tree()
    .size([360, height / 2 - 40])
    .separation(function (a, b) {
        return (a.parent === b.parent ? 1 : 2) / a.depth;
    });
var i = 0, root, tip, tipTimeout;

function init(file) {
    d3.json(file).then(
        function (data) {
            root = tree(d3.hierarchy(data));
            update(root)
        }, function (error) {
            console.error(error);
        }
    );
}

function changeWording(d) {
    root = null;
    update();
    setTimeout(function () {
        init('fall.json');
    }, duration * 2)


}

function update(source) {
    var nodes = root ? flatten(root) : [],
        links = root ? tree(root).links() : [];
    var link = g.selectAll(".link")
        .data(links, function (d) {
            return d.source.id + '-' + d.target.id;
        });
    var linkEnter = link.enter().insert("line", 'g').attr("class", "link")
        .attr('targetId', function (d) {
            return d.target.id
        })
        .attr('sourceId', function (d) {
            return d.source.id
        })
        .attr("x1", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.source)
        })
        .attr("y1", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        })
        .attr("x2", function (d) {
            return radialPoint(d.source.x, d.source.y)[0] + getLetterOffset(d.target)
        })
        .attr("y2", function (d) {
            return radialPoint(d.source.x, d.source.y)[1] + 15
        });
    linkEnter
        .style("opacity", 0)
        .transition()
        .duration(duration)
        .delay(function (d, i) {
            return (d.target.depth - 1 >= 0 ? d.target.depth - 1 : 0) * duration;
        })
        .style("opacity", 1)
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
        .style("opacity", 1)
        .transition()
        .duration(duration)
        .delay(function (d) {
            return (2 - d.target.depth) * duration;
        })
        .style("opacity", 0)
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
    level0Node
        .on("mouseover", createTip)
        .on("mouseout", removeTip)
        .on("click", click);
    var level1Node = nodeEnter.filter(function (d) {
        return d.depth === 1;
    });
    level1Node.on("click", click);
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
        .attr('cy', 15);

    level1Node.append('rect')
        .attr("class", 'symbol horizontal')
        .attr('x', function (d) {
            return d.data.width - 10 * 2 - 6
        })
        .attr('y', 14.5);
    level1Node.append('rect')
        .attr("class", 'symbol vertical')
        .attr('x', function (d) {
            return d.data.width - 10 * 2 - 1
        })
        .attr('y', 9.5)
        .style('display', function (d) {
            return d.children ? 'none' : 'block';
        });
    var level2Node = nodeEnter.filter(function (d) {
        return d.depth === 2;
    });
    level2Node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .on('click', changeWording);
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
    var trumpetIcon = level0Node
        .append('rect')
        .attr('x', function (d) {
            // console.log(level0Node.select('text'));
            return (d.data.value.length || 1) * 13 + 16;
        })
        .attr('y', -5)
        .attr('fill', 'url(#trumpetIcon)')
        .attr('class', 'trumpet')
        .on('click', pronunciation)
        .on('mouseover', function () {
            d3.event.stopPropagation()
        });
    node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(d.x, d.y) + ')'
        });
    node.select('.symbol.vertical').style('display', function (d) {
        return d.children ? 'none' : 'block';
    });
    nodeEnter
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(d.parent ? d.parent.x : 0, d.parent ? d.parent.y : 0) + ')'
        })
        .style("opacity", 0)
        .transition()
        .duration(duration)
        .delay(function (d) {
            return (d.depth - 1 >= 0 ? d.depth - 1 : 0) * duration;
        })
        .style("opacity", 1)
        .attr("transform", function (d) {
            return 'translate(' + radialPoint(d.x, d.y) + ')'
        });
    node.exit()
        .style("opacity", 1)
        .transition()
        .duration(duration)
        .delay(function (d) {
            return (2 - d.depth) * duration;
        })
        .style("opacity", 0)
        .attr("transform", function (d) {
            return "translate(" + radialPoint(d.parent ? d.parent.x : 0, d.parent ? d.parent.y : 0) + ")";
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
    var angle = (x - 90) / 180 * Math.PI, radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
    //return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = root.data.id + '-' + (++i);
            nodes.push(node);
        }
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

function dragstarted(d) {
    d.oldX = d.x;
    d.oldY = d.y;
    var oldTransform = radialPoint(d.oldX, d.oldY);
    d.oldRealX = oldTransform[0];
    d.oldRealY = oldTransform[1];
    d.linkCurrent = d3.select('line[targetId="' + d.id + '"]');

}

function dragged(d) {
    d3.select(this).attr("transform", function () {
        return 'translate(' + (d.oldRealX + d3.event.x - d.oldX) + ',' + (d.oldRealY + d3.event.y - d.oldY) + ')'
    });
    d.linkCurrent.attr("x2", function (s) {
        return d.oldRealX + d3.event.x - d.oldX + getLetterOffset(s.target)
    }).attr("y2", function () {
        return d.oldRealY + d3.event.y - d.oldY + 15
    });
}

function dragended(d) {
    d.x = d.oldX;
    d.y = d.oldY;
    d3.select(this).transition()
        .duration(300).attr("transform", function (d) {
        return 'translate(' + radialPoint(d.x, d.y) + ')'
    });
    d.linkCurrent
        .transition()
        .duration(300).attr("x2", function (s) {
        return radialPoint(d.x, d.y)[0] + getLetterOffset(s.target)
    }).attr("y2", function () {
        return radialPoint(d.x, d.y)[1] + 15
    });
    delete d.oldRealX;
    delete d.oldRealY;
    delete  d.linkCurrent;
}

function createTip(d) {
    var d3Event = d3.event;
    var showTip = function (d) {
        tip = d3.select('body').append('div')
            .attr('class', 'tip')
            .style("opacity", 0)
            .style('left', (d3Event.clientX + 15) + 'px')
            .style('top', (d3Event.clientY + 15) + 'px');
        tip.append('div').attr('class', 'tip-head').text(d.data.detail.soundmark);
        var ul = tip.append('ul'), translate = d.data.detail.translate;
        if (translate && translate.length) {
            for (var t = 0; t < translate.length; t++) {
                ul.append('li').text(translate[t].type + '. ' + translate[t].chinese)
            }
        }
        tip.transition()
            .duration(200)
            .style("opacity", 1)
    };
    tipTimeout = setTimeout(function () {
        showTip(d);
    }, 500);
}

function removeTip() {
    clearTimeout(tipTimeout);
    if (tip) {
        tip.remove();
    }
}

function pronunciation() {
    console.log('pronunciation fun here');
    d3.event.stopPropagation()
}