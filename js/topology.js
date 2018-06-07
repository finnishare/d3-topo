var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json('data.json').then(function (graph) {
    /*  var link = svg.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter().append("line")
          .attr("stroke-width", function(d) { return Math.sqrt(d.value); });*/

    var node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g")
        .attr('class', 'node')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));



    node.each(function(_each) {
        _each.append("rect")
            .attr("class", function (d) {
                return getClassByLevel(d);
            })
            .attr("width", function (d) {
                return 100;
            })
            .attr("height", 30);
    })
    node.append("text")
        .text(function (d) {
                return d.value;
            }
        ) .attr("class", function (d) {
        return getClassByLevel(d);
    }).attr('dy', '1em').attr('text-anchor','middle')

    /*var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("rect")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("class", function (d) {
            return getClassByLevel(d);
        })
        .attr("width", function (d) {
            return 100;
        })
        .attr("height", 30)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("text")
        .text(function (d) {
                return d.value;
            }.attr('x', 10).attr('y', 10)
        );*/

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    /* simulation.force("link")
         .links(graph.links);
 */
    function ticked() {
        /*  link
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });
  */
        node
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')'
            })
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            });
    }
}, function (error) {
    console.error(error);
});

function getClassByLevel(d) {
    switch (d.level) {
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

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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
