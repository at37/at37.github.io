var CountryOverYears={
    // Year-Season (Games) is Dropdown
    display: async function() {
        d3.select("#CountryOverYears").selectAll("text").remove();
        d3.select("#CountryOverYears").selectAll("svg").remove();
        d3.select("#CountryOverYears").selectAll("#countryDiv").remove();
        
        var margins = {top: 50, right: 50, bottom: 50, left: 50};
        var width = 1000;
        var height = 600;

        const data = await d3.csv('https://at37.github.io/data/athlete_events.csv');

        var countriesList = data.map(rec => rec["NOC"]);
        countriesList = [...new Set(countriesList)].sort();

        var gamesList = data.map(rec => rec["Games"]);
        gamesList = [...new Set(gamesList)].sort();

        var maxMedals = 0, maxGame = '';

        function getCountryMedalsList(country) {
            var filteredData = data.filter(function (d) { return d.NOC === country; });

            var gMedals = {};
            var sMedals = {};
            var bMedals = {};
            var totalMedals = {};
            var sortableGameList = [];
            
            for(var i = 0; i < gamesList.length; i ++) {
                gMedals[gamesList[i]] = 0;
                sMedals[gamesList[i]] = 0;
                bMedals[gamesList[i]] = 0;
                totalMedals[gamesList[i]] = 0;
            }

            for(var i=0; i < filteredData.length; i++) {
    
                if(filteredData[i].Medal === "Gold") {
                    gMedals[filteredData[i].Games]  = parseInt(gMedals[filteredData[i].Games]) + 1;
                    totalMedals[filteredData[i].Games] = parseInt(totalMedals[filteredData[i].Games]) + 1;
                }
    
                if(filteredData[i].Medal === "Silver") {
                    sMedals[filteredData[i].Games]  = parseInt(sMedals[filteredData[i].Games]) + 1;
                    totalMedals[filteredData[i].Games] = parseInt(totalMedals[filteredData[i].Games]) + 1;
                }
    
                if(filteredData[i].Medal === "Bronze") {
                    bMedals[filteredData[i].Games]  = parseInt(bMedals[filteredData[i].Games]) + 1;
                    totalMedals[filteredData[i].Games] = parseInt(totalMedals[filteredData[i].Games]) + 1;
                }
            }

            for(const [yearGame, totMed] of Object.entries(totalMedals)) {
                var x = parseInt(totMed);
                if (maxMedals < x) {
                    maxMedals = x;
                    maxGame = yearGame;
                }
            }

            for (var i = 0; i < gamesList.length; i++) {
                sortableGameList.push([gamesList[i], totalMedals[gamesList[i]]]);
            }

            return sortableGameList;

        }

        d3.select("#CountryOverYears").append("div")
            .attr("id", "countryDiv")
            .append("label")
            .text("Select a Country: ")
            .attr("style", "font-size:15px;font-family:Arial;font-weight: bold;color:#2C5F2D;");

        d3.select("#CountryOverYears")
            .select("#countryDiv")
            .append("select")
            .attr("id", "countryButton")
            .selectAll("myOptions")
            .data(countriesList)
            .enter().append("option")
            .text(function (d) { return d; })
            .attr("value", function(d) { return d; })
            .style("background-color", function(d) { return d === "USA" ? "#FFBE7B" : ""; })
            .property("selected", function(d) { return d === "USA"; }); // Pre-select the default list box option

        
        refreshChart('USA');
        d3.select('#countryButton')
            .style("background-color", "#FFBE7B") //set list box default color
            .on("change", function(d) {
            var selectedCountry = d3.select(this).property("value");
            refreshChart(selectedCountry);
        })
        
        function refreshChart(country) {

            d3.select("#CountryOverYears").selectAll("text").remove();
            d3.select("#CountryOverYears").selectAll("svg").remove();
            d3.select("#CountryOverYears").selectAll("g").remove();

            var sortedList = getCountryMedalsList(country);

            var svg = d3.select("#CountryOverYears").append("svg")
                .attr("width", width + 2 * margins.left)
                .attr("height", height + 2 * margins.bottom);
            
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
                .on("mouseover", dv_onMouseOver)
                .on("mouseout", dv_OnMouseOut);
            
            //d3.select("#CountryOverYears")
            svg.append("svg")
                .attr("height",20)
                .append("g")
                .append('text')
                .transition().duration(300)
                    .attr("x", 0).attr("y", 20)
                    .attr("id","annotation")
                    .text("**Hover the mouse over the Bars for more details")
                    .attr("font-size", "12px")
                    .attr("font-family","Arial")
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
                    .text("Medal Won by Country Over Years")
                    .attr("font-size", "30px")
                    .attr("fill", "blue")
                    .attr("font-weight", "bold");

            text.transition().duration(1000)
                    .attr("y", 78); // Update the y position for the animation
            //end 

            svg.append("g")
                .attr("id", "y")
                .attr("transform", "translate("+margins.top+","+margins.bottom+")")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("class", "y label")
                .attr("x", 200)
                .attr("y", height - 600)
                .attr("dy", ".75em")
                .style("font-family", "Arial")
                .style("fill", "darkblue")
                .attr("transform", "translate(0," + height + ") rotate(-90)")
                .text("Number of Medals Won");
            
            svg.append("g")
                .attr("transform", "translate("+margins.top+","+(height+margins.bottom)+")")
                .attr("id", "x")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10, 0)rotate(-30)")
                .style("text-anchor", "end");

            svg.append("text")
                .attr("class", "x label")
                .attr("x", 400)
                .attr("y", height + 100)
                .style("font-family", "Arial")
                .style("fill", "darkblue")
                .text("Olympic Event - Year and Season")

            // Tooltip code starts here

            var dv_tooltip = d3.select('#CountryOverYears')
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
                var html = "<span style = 'font-size:15px;font-family:Arial;font-weight: bold;color:#234E70'><b> Olympic event: </b>" + d.toString().split(",")[0] + "</span></br>" +
                           "<span style = 'font-size:15px;font-family:Arial;font-weight: bold;color:#2BAE66;position:center'><b><b> Country: </b>" + country + "</b></span></br>" +
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