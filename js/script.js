var w = verge.viewportW(),
    h = verge.viewportH();

var svg = d3.select('#root')
  .append('svg')
    .attr('width', w)
    .attr('height', h)
  .append('g');

var simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id(function (d) {
    return d.id;
  }).strength(0.025))
  .force('charge', d3.forceManyBody().strength(-90))
  .force('collide', d3.forceCollide().radius(12))
  .force('center', d3.forceCenter(w / 2, h / 2));

d3.json('./data/graph.json', function (error, graph) {
  if (error) throw error;

  var nodes = graph.nodes,
      links = graph.links;

  var link = svg.selectAll('.link')
      .data(links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('stroke', function (d){
        return '#ddd';
      });
  
  var node = svg.selectAll('.node')
      .data(nodes)
    .enter().append('g');

  node.append('circle')
      .attr('class', 'node')
      .attr('r', 6)
      .attr('fill', function (d) {
        return d.colour;
      })
      .on('mouseover', onMouseOver(0.2))
      .on('mouseout', onMouseOut);

  node.append('title')
      .text(function (d) {
        return d.name;
      });
  
  node.append('text')
      .attr('dx', 12)
      .attr('dy', '.25rem')
      .text(function (d) {
        return d.name;
      })
      .style('stroke', 'black')
      .style('stroke-width', 0.5)
      .style('fill', function (d) {
        return '#000';
      });

  simulation.nodes(nodes)
      .on('tick', onTick);

  // add the links to the simulation
  simulation.force('link')
      .links(links);

  function onTick() {
    link.attr('d', positionLink);
    node.attr('transform', positionNode);
  }

  function positionLink(d) {
    var offset = 30;

    var midpointX = (d.source.x + d.target.x) / 2;
    var midpointY = (d.source.y + d.target.y) / 2;

    var dx = (d.target.x - d.source.x);
    var dy = (d.target.y - d.source.y);

    var normalize = Math.sqrt((dx * dx) + (dy * dy));

    var offsetX = midpointX + offset * (dy / normalize);
    var offsetY = midpointY - offset * (dx / normalize);

    return 'M' + d.source.x + "," + d.source.y + 
      'S' + offsetX + ',' + offsetY + 
      ' ' + d.target.x + ',' + d.target.y;
  }

  function positionNode(d) {
    if (d.x < 0) d.x = 0;
    if (d.y < 0) d.y = 0;
    if (d.x > w) d.x = w;
    if (d.y > h) d.y = h;
    
    return 'translate(' + d.x + ',' + d.y + ')';
  }

  var linkedByIndex = {};
  links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });

  function isLinked(a, b) {
    return linkedByIndex[a.index + ',' + b.index] 
    || linkedByIndex[b.index + ',' + a.index] 
    || a.index === b.index;
  }

  function onMouseOver(opacity) {
    return function (d) {
      node.style('stroke-opacity', function (o) {
        return isLinked(d, o) ? 1 : opacity;
      });
      node.style('fill-opacity', function (o) {
        return isLinked(d, o) ? 1 : opacity;
      });
      link.style('stroke-opacity', function (o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
      link.style('stroke', function (o) {
        return o.source === d || o.target === d ? o.source.colour : '#ddd';
      });
    };
  }

  function onMouseOut() {
    node.style('stroke-opacity', 1);
    node.style('fill-opacity', 1);
    link.style('stroke-opacity', 1);
    link.style('stroke", "#ddd');
  }
});
