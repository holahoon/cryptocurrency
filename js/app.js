const selection = document.querySelector("#currency-selection");
const conversion1 = document.querySelector("#currency-conversion1");
const conversion2 = document.querySelector("#currency-conversion2");
const converting = document.querySelector(".converting-value");

const apiKey = "a0e943fcc985402ca15e15610e88aa5c";
let url_latest = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`;

let Values = {};

let d = new Date();
d.setDate(d.getDate() - 5);

// ----------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  xhr_latest = new XMLHttpRequest();
  xhr_latest.open("GET", url_latest, true);
  xhr_latest.send();
  xhr_latest.onload = () => {
    if (xhr_latest.status === 200) {
      json = JSON.parse(xhr_latest.responseText);

      // load the dropdown
      loadDropdown(json.rates, conversion1);
      loadDropdown(json.rates, conversion2);

      // currency conversion - selecting currency || currency input
      converting.addEventListener("input", () => {
        Values.converting_value = converting.value;
        showConverted();
      });
      conversion1.addEventListener("change", () => {
        Values.conversion1_value = conversion1.value;
        showConverted();
      });
      conversion2.addEventListener("change", () => {
        Values.conversion2_value = conversion2.value;
        showConverted();
        showName(conversion2.options[conversion2.selectedIndex].text);
      });
    } else {
      alert("xhr_latest - " + xhr_latest.statusText);
    }
  };

  // run cryptocurrency graph
  getCrypto();

  // run bitcoin dropdown api
  const curr_url = "https://api.coindesk.com/v1/bpi/currentprice.json";
  fetch(curr_url)
    .then(response => response.json())
    .then(data => {
      loadDropdown(data.bpi, selection);
    })
    .catch(error => alert("Bitcoin: " + error));

  // dropdown - selecting a bitcoin currency
  selection.addEventListener("change", () => {
    const selected = selection.value;
    showRates(selected);
  });
});

// --- functions ---

function showName(option) {
  const url_currencies = "https://openexchangerates.org/api/currencies.json";
  fetch(url_currencies)
    .then(response => response.json())
    .then(data => {
      for (key in data) {
        if (option === key) {
          document.querySelector(".message").innerHTML = data[key];
        }
      }
    })
    .catch(error => alert("Currency Name: " + error));
}

function showConverted() {
  // --- ** Currency conversion requests only available for unlimited plan customers ** --
  // let url_convert = `https://openexchangerates.org/api/convert/${converting_value}/${currency_from}/${currency_to}?app_id=${apiKey}`;
  // console.log(url_convert);
  // ajax = new XMLHttpRequest();
  // ajax.open("GET", url_convert, true);
  // // ajax.send();
  // ajax.onload = () => {
  //   if (ajax.status === 200) {
  //     json = JSON.parse(ajax.responseText);
  //   } else {
  //     alert("ajax failed");
  //   }
  // };

  // Check to see if all the values are selected to run the calculation
  if (
    Values.converting_value &&
    Values.conversion1_value &&
    Values.conversion2_value
  ) {
    convertedValue =
      (Values.converting_value * Values.conversion2_value) /
      Values.conversion1_value;
    // document.querySelector(".conversion-result").innerHTML =
    //   Math.round(convertedValue * 100) / 100;
    document.querySelector(".converting-result").value =
      Math.round(convertedValue * 100) / 100;
  } else {
    document.querySelector(".converting-result").value = "";
  }
}

function showRates(selected) {
  const curr_url = "https://api.coindesk.com/v1/bpi/currentprice.json";
  fetch(curr_url)
    .then(response => response.json())
    .then(data => {
      for (let key in data.bpi) {
        if (selected === key) {
          document.querySelector(".amount").innerHTML = `${
            data.bpi[key].symbol
          } ${Math.round(data.bpi[key].rate_float * 100) / 100}`;
          document.querySelector(".name").innerHTML = data.bpi[key].description;
        }
      }
    })
    .catch(error => alert("Bitcoin error: " + error));
}

function loadDropdown(rates, parent) {
  // if dropdown to make is for currency conversion, make options with values of the object's values
  if (parent === conversion1 || parent === conversion2) {
    for (let key in rates) {
      if (rates.hasOwnProperty(key)) {
        let option = document.createElement("option");
        option.value = rates[key];
        option.innerHTML = key;
        parent.appendChild(option);
      }
    }
    // if dropdown to make is for showing current bitcoin information, make options with values of the object's keys
  } else {
    for (let key in rates) {
      if (rates.hasOwnProperty(key)) {
        let option = document.createElement("option");
        option.value = key;
        option.innerHTML = key;
        parent.appendChild(option);
      }
    }
  }
}

// --- GRAPH ---------------

function getCrypto() {
  const his_url = "https://api.coindesk.com/v1/bpi/historical/close.json";
  fetch(his_url)
    .then(response => response.json())
    .then(data => {
      const parsedData = parseData(data);
      if (window.innerWidth < 420) {
        displayGraph_mobile(parsedData);
      } else {
        displayGraph(parsedData);
      }
    })
    .catch(error => alert("Bitcoin: " + error));
}

/**
 * Parse date into key-value pairs
 * @param {object} data Object containing historical data of BPI
 */
function parseData(data) {
  let array = [];
  for (let key in data.bpi) {
    let parts = key.split("-");
    let myDate = new Date(parts[0], parts[1] - 1, parts[2]);
    let parseTime = d3.timeFormat("%B %d");

    array.push({
      display_date: parseTime(myDate),
      date: myDate,
      value: +data.bpi[key] // convert string to number
    });
  }
  return array;
}

function displayGraph(data) {
  const svg_container = document.querySelector(".svg-container");
  // const width = svg_container.offsetWidth;
  // const height = svg_container.offsetHeight;
  const margin = { top: 30, right: 100, bottom: 30, left: 100 };
  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const radius = 5;
  const width = svg_container.offsetWidth * 0.8;
  const height = svg_container.offsetHeight * 0.8;

  const svg = d3
    .select(svg_container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);
  // .attr('viewBox','0 0 '+Math.min("100%","100%")+' '+Math.min("100%","100%"))
  // .attr("preserveAspectRatio", "xMinYMin");

  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opactiy", 0)
    .style("display", "none");

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const lineGenerator = d3
    .line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const circle = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.value))
    .attr("r", radius)
    .attr("fill", "#888")
    .on("mouseover", d => {
      div
        .transition()
        .duration(200)
        .style("display", "block")
        .style("opacity", 0.95);
      div
        .html(
          `<span>$${Math.round(d.value * 100) / 100}</span><span>${
            d.display_date
          }</span>`
        )
        .style("left", d3.event.pageX - 5 + "px")
        .style("top", d3.event.pageY - 80 + "px");
    })
    .on("mouseout", () => {
      div
        .transition()
        .duration(400)
        .style("opacity", 0);
    });

  const path = svg
    .append("path")
    .attr("d", lineGenerator(data))
    .attr("stroke", "#f7f7f7")
    .attr("fill", "none")
    .attr("stroke-width", "1.5");

  const totalLength = path.node().getTotalLength(); // get the total length of path

  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition() // call the transition method
    .duration(3000) // duration time
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0); // final value of dash-offset for transition

  svg
    .append("g")
    .attr("transform", `translate(${0}, ${height - padding.bottom})`)
    .attr("class", "axis")
    .call(xAxis)
    .selectAll("text")
    .remove();
  svg
    .append("g")
    .attr("transform", `translate(${margin.left - 30}, ${0})`)
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -30)
    .attr("y", 10)
    .attr("dy", "0.6em")
    .attr("text-anchor", "end")
    .text("price ($)");
}

// Displaying graph for smaller screen (mobile)
function displayGraph_mobile(data) {
  const svg_container = document.querySelector(".svg-container");
  const margin = { top: 30, right: 50, bottom: 30, left: 90 };
  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const radius = 3;
  const width = svg_container.offsetWidth;
  const height = svg_container.offsetHeight * 0.9;

  const svg = d3
    .select(svg_container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opactiy", 0)
    .style("display", "none");

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const lineGenerator = d3
    .line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const circle = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.value))
    .attr("r", radius)
    .attr("fill", "#888")
    .on("mouseover", d => {
      div
        .transition()
        .duration(200)
        .style("display", "block")
        .style("opacity", 0.95);
      div
        .html(
          `<span>$${Math.round(d.value * 100) / 100}</span><span>${
            d.display_date
          }</span>`
        )
        .style("left", d3.event.pageX - 10 + "px")
        .style("top", d3.event.pageY - 70 + "px");
    })
    .on("mouseout", () => {
      div
        .transition()
        .duration(400)
        .style("opacity", 0);
    });

  const path = svg
    .append("path")
    .attr("d", lineGenerator(data))
    .attr("stroke", "#f7f7f7")
    .attr("fill", "none")
    .attr("stroke-width", "1");

  const totalLength = path.node().getTotalLength(); // get the total length of path

  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition() // call the transition method
    .duration(3000) // duration time
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0); // final value of dash-offset for transition

  svg
    .append("g")
    .attr("transform", `translate(${0}, ${height - padding.bottom})`)
    .attr("class", "axis")
    .call(xAxis)
    .selectAll("text")
    .remove();
  svg
    .append("g")
    .attr("transform", `translate(${margin.left - 30}, ${0})`)
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -30)
    .attr("y", 10)
    .attr("dy", "0.6em")
    .attr("text-anchor", "end")
    .text("price ($)");
}
