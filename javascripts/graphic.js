;
(function() {
  var width = 640,
      height = 480,
      margin = [0, 90, 0, 0]
      start = Math.min(d3.min(window.data['blog'], Date.parse), d3.min(window.data['twitter'], Date.parse)) - (7*86400000),
      end = new Date(),
      x = d3.time.scale()
        .domain([start, end])
        .range([0,width - margin[1] - margin[3]]),
      svg = d3.select("section#graphic").append("svg")
        .attr('width', width)
        .attr('height', height)
        .append('g')
          .attr('width', width - margin[1] - margin[3])
          .attr('height', height - margin[0] - margin[2])
          .attr("transform", "translate("+margin[3]+","+margin[0]+")");

  var blog = svg.append('g')
  blog.selectAll('circle')
    .data(window.data['blog'])
    .enter().append('circle')
      .style('fill', '#B2CC1F')
      .attr('cy', 0)
      .attr('cx', function(d){return x(Date.parse(d));})
      .attr('r', 6);

  blog.append('text')
    .attr('x', width-margin[1] + 20)
    .attr('dy', '.40em')
    .text('Blog');

  blog.attr("transform", "translate(0," + 6 + ")");

  var twitter = svg.append('g')
  twitter.selectAll('circle')
    .data(window.data['twitter'])
    .enter().append('circle')
      .style('fill', '#4099FF')
      .attr('cy', 0)
      .attr('cx', function(d){return x(Date.parse(d));})
      .attr('r', 6);

  twitter.attr("transform", "translate(0," + 30 + ")");

  twitter.append('text')
    .attr('x', width-margin[1] + 20)
    .attr('dy', '.4em')
    .text('Twitter');

  var twitter = svg.append('g')
  twitter.selectAll('circle')
    .data(window.data['code'])
    .enter().append('circle')
      .style('fill', '#FF6759')
      .attr('cy', 0)
      .attr('cx', function(d){return x(Date.parse(d));})
      .attr('r', 6);

  twitter.attr("transform", "translate(0," + 54 + ")");

  twitter.append('text')
    .attr('x', width-margin[1] + 20)
    .attr('dy', '.4em')
    .text('Code');

}());
