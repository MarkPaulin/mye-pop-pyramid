"use strict";

function draw(data) {
  // variables for size of svg
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    gutter = 30,
    pyramid_height = height - 205,
    cx = width / 2;

  // data related variables
  var filtered_data = data,
    domain_age = d3.map(data, d => d.age_5).keys(),
    domain_gender = d3.map(data, d => d.gender).keys(),
    domain_count = [0, d3.max(data, d => d.count)],
    domain_year = d3.extent(data, d => d.year),
    domain_ratio = [0, 1];

  // start with most recent year
  // check: can this data be accessed directly? opendata NI?
  var current_year = domain_year[1],
    current_band  = '',
    any_clicked = false;

  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform',
          `translate(${margin.left}, ${margin.top})`);

  // axes -----------------------------------------------------

  // age axes
  var scale_age = d3.scaleBand()
    .domain(domain_age.reverse())
    .range([0, pyramid_height])
    .paddingInner(0.05);

  var axis_age_left = d3.axisLeft()
    .scale(scale_age)
    .tickSize(0);

  var axis_age_right = d3.axisRight()
    .scale(scale_age)
    .tickFormat('')
    .tickSize(0);

  var axis_age_left_svg = svg.append('g')
    .attr('class', 'axis age')
    .attr('transform', `translate(${cx + gutter/2 + 10}, 0)`)
    .call(axis_age_left);

  var axis_age_right_svg = svg.append('g')
    .attr('class', 'axis age')
    .attr('transform', `translate(${cx - gutter/2 - 10}, 0)`)
    .call(axis_age_right);

  axis_age_left_svg.append('text')
    .attr('dy', '.3em')
    .text('Age');

  axis_age_left_svg.selectAll('text')
    .attr('x', - gutter / 2 - 10)
    .style('text-anchor', 'middle');

  // population axes
  var scale_count = d3.scaleLinear()
    .domain(domain_count)
    .range([0, 250]);

  var scale_male = d3.scaleLinear()
    .domain(domain_count.reverse())
    .range([0, 250]);

  var axis_female = d3.axisBottom()
    .scale(scale_count)
    .ticks(5)
    .tickSize(0);

  svg.append('g')
    .attr('class', 'axis population female')
    .attr('transform',
        `translate(${cx + gutter}, ${pyramid_height + 5})`)
    .call(axis_female);

  var axis_male = d3.axisBottom()
    .scale(scale_male)
    .ticks(5)
    .tickSize(0);

  svg.append('g')
    .attr('class', 'axis population male')
    .attr('transform',
        `translate(${cx - gutter - 250}, ${pyramid_height + 5})`)
    .call(axis_male);

  // gridlines
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform',
        `translate(${cx + gutter}, ${pyramid_height + 5})`)
    .call(d3.axisBottom(scale_count).tickSize(-pyramid_height).tickFormat('').ticks(5));

  svg.append('g')
    .attr('class', 'grid')
    .attr('transform',
        `translate(${cx - gutter - 250}, ${pyramid_height + 5})`)
    .call(d3.axisBottom(scale_male).tickSize(-pyramid_height - 10).tickFormat('').ticks(5));

  // add the bars
  var bars = svg.append('g')
    .attr('class', 'population pyramid');

  // add the year label
  var svg_desc = svg.append('text')
    .attr('class', 'desc')
    .attr('transform',
          'translate(' + cx + ', ' + (pyramid_height + 50) + ')');


  // year
  var scale_year = d3.scaleLinear()
    .domain(domain_year)
    .range([0, 400]);

  var axis_year = d3.axisBottom()
    .scale(scale_year)
    .ticks(5)
    .tickFormat(String)
    .tickSizeOuter(0);

  var svg_axis_year = svg.append('g')
    .attr('class', 'axis year')
    .attr('transform',
        `translate(${cx - 200}, ${pyramid_height + 85})`)
    .call(axis_year);

  // year pointer
  var year_pointer = d3.symbol()
    .type(d3.symbolTriangle)
    .size('100');

  var year_slider = svg_axis_year.append('g');

  year_slider.append('rect')
    .attr('class', 'slidebox')
    .attr('width', 420)
    .attr('height', 25)
    .attr('transform', 'translate(0, -25)');

  var handle = year_slider.append('path')
    .attr('d', year_pointer)
    .attr('class', 'hand')
    .attr('fill', 'lightgrey')
    .attr('fill-opacity', 1.0)
    .attr('stroke', 'none')
    .attr('transform',
        `translate(${scale_year(current_year)}, -10) rotate(180)`);

  year_slider.call(d3.drag().on('start', started));

  // ratio
  var ratio_chart = svg.append('g')
    .attr('transform',
        `translate(${cx - 200}, ${pyramid_height + 120})`);

  var scale_ratio = d3.scaleLinear()
    .domain(domain_ratio)
    .range([0, 200]);

  var scale_gender = d3.scaleBand()
    .domain(domain_gender)
    .range([0, 50])
    .padding(0.1);

  // ratio bars
  var ratio_bars = ratio_chart.append('g').
    attr('class', 'ratio bars');

  var ratio_text = ratio_chart.append('g')
    .attr('class', 'ratio text');



  draw_year(current_year, true, current_band);


  function draw_pyramid(year, animate, band) {
    var if_male = d => d.gender === 'M',
      x_pos = d => {
        return if_male(d)
          ? cx - gutter - scale_count(d.count)
          : cx + gutter;
        },
      fill_op = d => 1;

    if (band != '') {
      fill_op = d => d.age_5 === band ? 1 : 0.5;
    }

    var bar = bars.selectAll('.bar').data(filtered_data);

    bar.transition()
      .duration(animate ? 400 : 0)
      .attr('x', d => x_pos(d))
      .attr('width', d => scale_count(d.count));

    bar.exit()
      .remove();

    bar.enter()
      .append('rect')
      .attr('class', d => 'bar ' + d.gender)
      .attr('height', scale_age.bandwidth)
      .attr('width', d => scale_count(d.count))
      .attr('x', d => x_pos(d))
      .attr('y', d => scale_age(d.age_5))
      .attr('fill-opacity', d => fill_op(d));

    d3.select('.pyramid.population')
      .selectAll('rect')
      .on('mouseover', d => mouseover(d.age_5))
      .on('mouseout', d => mouseout(d.age_5))
      .on('click', d => clicked(d.age_5));

    var pop_total = d3.sum(filtered_data, d => d.count);
    pop_total = d3.format(',')(pop_total);
    
    svg_desc.text('In ' + current_year + ', the Northern Ireland population was ' + pop_total);
  }

  function draw_ratios(year, animate, band) {

    var year_data = data.filter(d => d.year === year);

    if (band != '') {
      year_data = year_data.filter(d => d.age_5 === band);
    }

    var total = d3.sum(year_data, d => d.count),
      female_total = d3.sum(year_data.filter(d => d.gender === 'F'), d => d.count),
      male_total = total - female_total;

    var ratio_data = [
      {gender: 'F', count: female_total, ratio: female_total/total},
      {gender: 'M', count: male_total, ratio: male_total/total}
      ];

    var ratio_bar = ratio_bars.selectAll('.bar').data(ratio_data);

    ratio_bar.transition()
      .duration(animate ? 400 : 0)
      .attr('width', d => scale_ratio(d.ratio));

    ratio_bar.exit()
      .remove();

    ratio_bar.enter()
      .append('rect')
      .attr('class', d => 'ratio bar ' + d.gender)
      .attr('height', scale_gender.bandwidth())
      .attr('y', d => scale_gender(d.gender))
      .attr('x', 200)
      .attr('width', d => scale_ratio(d.ratio));

    var update_text = ratio_text.selectAll('.text').data(ratio_data);

    var generate_label = function(s) {
      var gen = (s.gender === 'F' ? 'Females' : 'Males');
      var bnd = (band === '' ? '' : ' ' + band);
      var cnt = d3.format(',')(s.count);
      var pct = d3.format('.1%')(s.ratio);

      var label = gen + bnd + ': ' + cnt + ' (' + pct + ')';
      return label;
    }

    update_text.transition()
      .duration(animate ? 400 : 0)
      .text(d => generate_label(d))
      .attr('y', d => scale_gender(d.gender) + scale_gender.bandwidth()/2)
      .attr('x', 190)
      .attr('dy', '0.3em')
      .attr('text-anchor', 'end');

    update_text.exit().remove();

    update_text.enter()
      .append('text')
      .attr('class', 'ratio text')
      .text(d => generate_label(d))
      .attr('y', d => scale_gender(d.gender) + scale_gender.bandwidth()/2)
      .attr('x', 190)
      .attr('dy', '0.3em')
      .attr('text-anchor', 'end');

  }

  function mouseover(band) {

    if (!any_clicked) {
      d3.select('.pyramid.population')
        .selectAll('rect')
        .attr('fill-opacity', d => d.age_5 === band ? 1 : 0.5);

      draw_ratios(current_year, true, band);
    }

  }

  function mouseout(band) {

    if (!any_clicked) {
      d3.select('.pyramid.population')
        .selectAll('rect')
        .attr('fill-opacity', 1);

      draw_ratios(current_year, true, '');
    }

  }

  function clicked(band) {
    current_band = !any_clicked ? band : '';

    any_clicked = !any_clicked
    mouseover(band)
  }

  function started() {
    handle.attr('stroke', 'black');

    d3.event.on('drag', dragging).on('end', ended);

    function dragging() {
      var x_new = d3.event.x < 0 ? 0 : d3.event.x;
      x_new = x_new > 400 ? 400 : x_new;

      handle.attr('transform',
              `translate(${x_new}, -10) rotate(180)`);

      current_year = Math.round(scale_year.invert(x_new));

      draw_year(current_year, false, current_band);
    }

    function ended() {
      handle.attr('stroke', 'none');

      var x_final = d3.event.x < 0 ? 0 : d3.event.x;
      x_final = x_final > 400 ? 400 : x_final;

      current_year = Math.round(scale_year.invert(x_final));

      x_final = scale_year(current_year);

      handle.attr('transform',
              `translate(${x_final}, -10) rotate(180)`);

      draw_year(current_year, true, current_band);
    }
  }

  function draw_year(year, animate, band) {
    filtered_data = data.filter(d => d.year === year);
    draw_pyramid(year, animate, band);
    draw_ratios(year, animate, band);
  }
};
