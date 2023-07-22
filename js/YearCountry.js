var YearCountry={
    // Year-Season (Games) is Dropdown
    display: async function() {
        d3.select("#YearCountry").selectAll("text").remove();
        d3.select("#YearCountry").selectAll("svg").remove();
        d3.select("#YearCountry").selectAll("#gameDiv").remove();
        
        var margins = {top: 50, right: 50, bottom: 50, left: 50};
        var width = 1000;
        var height = 500;

        const data = await d3.csv('https://at37.github.io/data/athlete_events.csv');

        var gamesList = data.map(rec => rec["Games"]);
        gamesList = [...new Set(gamesList)].sort();

        var countryList = data.map(rec => rec["NOC"]);
        countryList = [...new Set(countryList)];
        
        var maxMedals = 0, maxCountry = '';

        function getSortedList(game) {
            var filteredData = data.filter(function (d) { return d.Games === game; });

            var gMedals = {};
            var sMedals = {};
            var bMedals = {};
            var totalMedals = {};
            var sortableCntList = [];

            for(var i = 0; i < filteredData.length; i++){
                gMedals[filteredData[i].NOC] = 0;
                sMedals[filteredData[i].NOC] = 0;
                bMedals[filteredData[i].NOC] = 0;
                totalMedals[filteredData[i].NOC] = 0;
            }

            for(var i=0; i < filteredData.length; i++) {
    
                if(filteredData[i].Medal === "Gold") {
                    gMedals[filteredData[i].NOC]  = parseInt(gMedals[filteredData[i].NOC]) + 1;
                    totalMedals[filteredData[i].NOC] = parseInt(totalMedals[filteredData[i].NOC]) + 1;
                }
    
                if(filteredData[i].Medal === "Silver") {
                    sMedals[filteredData[i].NOC]  = parseInt(sMedals[filteredData[i].NOC]) + 1;
                    totalMedals[filteredData[i].NOC] = parseInt(totalMedals[filteredData[i].NOC]) + 1;
                }
    
                if(filteredData[i].Medal === "Bronze") {
                    bMedals[filteredData[i].NOC]  = parseInt(bMedals[filteredData[i].NOC]) + 1;
                    totalMedals[filteredData[i].NOC] = parseInt(totalMedals[filteredData[i].NOC]) + 1;
                }
            }

            for(const [cnty, totMed] of Object.entries(totalMedals)) {
                var x = parseInt(totMed);
                if (maxMedals < x) {
                    maxMedals = x;
                    maxCountry = cnty;
                }
            }

            for (var country in totalMedals) {
                sortableCntList.push([country, totalMedals[country]]);
            }

            sortableCntList = sortableCntList.filter(function (d) { 
                return parseInt(d.toString().split(",")[1]) > 0 
            });

            sortableCntList.sort(function(a, b) {
                return b[1] - a[1];
            });

            return sortableCntList;

        }

        d3.select("#YearCountry").append("div")
            .attr("id", "gameDiv")
            .append("label")
            .text("Select an Event (Year Season): ")
            .attr("style", "font-size:15px;font-family:Arial;font-weight: bold;color:#2C5F2D");

        d3.select("#YearCountry")
            .select("#gameDiv")
            .append("select")
            .attr("id", "gameButton")
            .selectAll("myOptions")
            .data(gamesList)
            .enter().append("option")
            .text(function (d) { return d; })
            .attr("value", function(d) { return d; })
            .style("background-color", "#FFBE7B"); // Set the background color of the list box
        
        refreshChart('1896 Summer');
        
        d3.select('#gameButton')
            .style("background-color", "#FFBE7B") //set list box default color
            .on("change", function(d) {
            var selectedGame = d3.select(this).property("value");
            refreshChart(selectedGame);
        })
        
        function refreshChart(game) {

            d3.select("#YearCountry").selectAll("text").remove();
            d3.select("#YearCountry").selectAll("svg").remove();
            d3.select("#YearCountry").selectAll("g").remove();
            //console.log("All removed");

            var sortedList = getSortedList(game);

            var svg = d3.select("#YearCountry").append("svg")
                .attr("width", width + 2 * margins.left)
                .attr("height", height + 2 * margins.bottom);

            var colorScale = d3.scaleLinear()
                .domain([0, maxMedals])
                .range(["#BFEFFF", "#00264C"]);

            var x = d3.scaleBand()
                .domain(sortedList.map(function(d) { return d.toString().split(",")[0] ; }))
                .range([0, width])
                .padding(0.1);
            
            var y = d3.scaleLinear()
                .domain([0, maxMedals + 100])
                .range([height, 0]);

            svg.append("g").attr("transform", "translate("+ margins.left +","+ margins.right +")").selectAll("rect")
                .data(sortedList)
                .enter().append("rect")
                .attr("x", function(d, i) { return x(d.toString().split(",")[0]); })
                .attr("y", function(d, i) { return y(parseInt(d.toString().split(",")[1])); } )
                .attr("width", x.bandwidth())
                .attr("height", function(d, i) { return height - y(parseInt(d.toString().split(",")[1])); })
                .style("fill", function(d, i) { return colorScale(parseInt(d.toString().split(",")[1])); })
                .on("mouseover", dv_onMouseOver)
                .on("mouseout", dv_OnMouseOut);
            
            //d3.select("#YearCountry")
            svg.append("svg")
                .attr("height",20)
                .append("g")
                .append('text')
                .transition().duration(300)
                    .attr("x", 0).attr("y", 20)
                    .attr("id","annotation")
                    .text("**Hover the mouse over the bars for more details")
                    .attr("font-family","Arial")
                    .attr("font-size", "12px")
                    .attr("font-weight","italic").style("fill", "red").attr("font-weight","bold");

            //start
            const rect = svg.append('rect')
            .attr("x", 200) // Adjust the x position to center the rectangle
            .attr("y", 85) // Adjust the y position to center the rectangle
            .attr("width", 900)
            .attr("height", 40)
            .attr("fill", "lightblue")
            .attr("stroke", "black");

            rect.transition().duration(1000)
                    .attr("y", 50); // Update the y position for the animation

            const text = svg.append("text")
                    .attr("id", "annotation")
                    .attr("x", 400) // Half the width of the SVG
                    .attr("y", -50) // Move the text above the rectangle
                    .text("Medal Winners of the Event by Country")
                    .attr("font-size", "30px")
                    .attr("fill", "blue")
                    .attr("font-weight", "bold");

            text.transition().duration(1000)
                    .attr("y", 78); // Update the y position for the animation
            //end 

            //d3.select("svg").append("g")
            svg.append("g")
                .attr("id", "y")
                .attr("transform", "translate("+margins.top+","+margins.bottom+")")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("class", "y label")
                //.attr("text-anchor", "end")
                .attr("x", 100)
                .attr("y", height - 500)
                .attr("dy", ".75em")
                .attr("transform", "translate(0," + height + ") rotate(-90)")
                .style("font-family", "Arial")
                .style("fill", "darkblue")
                .text("Number of Medals Won");
            
            //var g = d3.select("svg").append("g")
            svg.append("g")
                .attr("transform", "translate("+margins.top+","+(height+margins.bottom)+")")
                .attr("id", "x")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10, 0)rotate(-45)")
                .style("text-anchor", "end");

            svg.append("text")
                .attr("class", "x label")
                .attr("x", 500)
                .attr("y", height + 95)
                .style("font-family", "Arial")
                .style("fill", "darkblue")
                .text("Country - Olympic Country Code")

            // Tooltip code starts here

            var dv_tooltip = d3.select('#YearCountry')
                .append('div')
                .attr('class', 'tooltip')
                .style('display', 'none');
        
            function dv_onMouseOver() {
                d3.select(this)
                .attr("r", 10)
                .transition()
                .duration(200)
                .style("opacity", 1.85);
            
                var d = d3.select(this).data()[0]
                var html = "<span style = 'font-size:15px;font-family:Arial;font-weight: bold;color:#234E70;position:center'><b>" + game + "</b></span></br>" +
                "<span style = 'font-size:15px;font-family:Arial;font-weight: bold;color:#2BAE66'><b> Country: </b>" + d.toString().split(",")[0] + "</span></br>" +
                "<span style = 'font-size:12px;font-family:Arial;font-weight: bold;color:#EE4E34'><b> Total Medals: </b>" + parseInt(d.toString().split(",")[1]) + "</span>";
            
                dv_tooltip
                    .style('display', 'inline')
                    .html(html)
                    .style('position', "absolute")
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px')
                    .style('width', 150)
                    .style('height', 100)
                    .style('background', function(){ return("lightgrey"); });

            }

            function dv_OnMouseOut() {
                d3.select(this).attr("r", 4);
                dv_tooltip.style('display', 'none');
            }

            // Tooltip code ends here

        }

    }
}