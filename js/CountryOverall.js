var Overall={
    display: async function() {
        d3.select("#Overall").selectAll("text").remove();
        d3.select("#Overall").selectAll("svg").remove();


        var margins = {top: 50, right: 50, bottom: 50, left: 50};
        var width = 3000;
        var height = 800;

        const data = await d3.csv('https://at37.github.io/data/athlete_events.csv');
 
        var countryList = [];
        var gMedals = {};
        var sMedals = {};
        var bMedals = {};
        var totalMedals = {};

        for(var i = 0; i < data.length; i++){
            gMedals[data[i].NOC] = 0;
            sMedals[data[i].NOC] = 0;
            bMedals[data[i].NOC] = 0;
            totalMedals[data[i].NOC] = 0;
        }

        for(var i=0; i < data.length; i++) {
            country = data[i].NOC;
            countryList.push(country);

            if(data[i].Medal === "Gold") {
                gMedals[data[i].NOC]  = parseInt(gMedals[data[i].NOC]) + 1;
                totalMedals[data[i].NOC] = parseInt(totalMedals[data[i].NOC]) + 1;
            }

            if(data[i].Medal === "Silver") {
                sMedals[data[i].NOC]  = parseInt(sMedals[data[i].NOC]) + 1;
                totalMedals[data[i].NOC] = parseInt(totalMedals[data[i].NOC]) + 1;
            }

            if(data[i].Medal === "Bronze") {
                bMedals[data[i].NOC]  = parseInt(bMedals[data[i].NOC]) + 1;
                totalMedals[data[i].NOC] = parseInt(totalMedals[data[i].NOC]) + 1;
            }
        }

        var maxMedals = 0, maxCountry = '';

        for(const [cnty, totMed] of Object.entries(totalMedals)) {
            var x = parseInt(totMed);
            if (maxMedals < x) {
                maxMedals = x;
                maxCountry = cnty;
            }
        }


        let sortableCntList = [];
        for (var country in totalMedals) {
            sortableCntList.push([country, totalMedals[country]]);
        }

        // filtering for only countries with more than 0 medals in total
        sortableCntList = sortableCntList.filter(function (d) { 
            return parseInt(d.toString().split(",")[1]) > 0 
          });

        sortableCntList.sort(function(a, b) {
            return b[1] - a[1];
        });
        
        var svg = d3.select("#Overall").append("svg")
            .attr("width", width + 2 * margins.left)
            .attr("height", height + 2 * margins.bottom);

        
        var colorScale = d3.scaleLinear()
            .domain([0, maxMedals])
            .range(["#BFEFFF", "#00264C"]);

        var x = d3.scaleBand()
            .domain(sortableCntList.map(function(d) { return d.toString().split(",")[0] ; }))
            .range([0, width])
            .padding(0.1);       

        var y = d3.scaleLinear()
            .domain([0, maxMedals + 100])
            .range([height, 0]);

        svg.append("g").attr("transform", "translate("+ margins.left +","+ margins.right +")").selectAll("rect")
            .data(sortableCntList)
            .enter().append("rect")
            .attr("x", function(d, i) { return x(d.toString().split(",")[0]); })
            .attr("y", function(d, i) { return y(parseInt(d.toString().split(",")[1])); } )
            .attr("width", x.bandwidth())
            .attr("height", function(d, i) { return height - y(parseInt(d.toString().split(",")[1])); })
            .style("fill", function(d, i) { return colorScale(parseInt(d.toString().split(",")[1])); })
            .on("mouseover", dv_onMouseOver)
            .on("mouseout", dv_OnMouseOut);

        svg.append("svg")
            .attr("height",20)
            .append("g")
            .append('text')
            .transition().duration(300)
                .attr("x", 0).attr("y", 20)
                .attr("id","annotation")
                .text("**Hover the mouse over the bars for more details")
                .attr("font-size", "12px")
                .attr("font-family","Arial")
                .attr("font-weight","italic").style("fill", "red").attr("font-weight","bold");

        //start
        const rect = svg.append('rect')
                .attr("x", 300) // Adjust the x position to center the rectangle
                .attr("y", 185) // Adjust the y position to center the rectangle
                .attr("width", 950)
                .attr("height", 40)
                .attr("fill", "lightblue")
                .attr("stroke", "black");
    
        rect.transition().duration(1000)
                .attr("y", 50); // Update the y position for the animation
    
        const text = svg.append("text")
                .attr("id", "annotation")
                .attr("x", 400) // Half the width of the SVG
                .attr("y", -50) // Move the text above the rectangle
                .text("All-time total medals won by Country in descending order")
                .attr("font-size", "30px")
                .attr("fill", "blue")
                .attr("font-weight", "bold");
    
        text.transition().duration(1000)
                .attr("y", 78); // Update the y position for the animation
        //end 

        svg.append("g")
            .attr("id", "y")
            .attr("transform", "translate("+margins.top+","+(margins.bottom + 20)+")") //updated
            .call(d3.axisLeft(y));

        var y_label = d3.select('#Overall')
            .append('div')
            .attr('class', 'y label');

        svg.append("text")
            .attr("class", "y label")
            //.attr("text-anchor", "end")
            .attr("x", 100)
            .attr("y", height - 800)
            .attr("dy", ".75em")
            .style("font-family", "Arial")
            .style("fill", "darkblue")
            .attr("transform", "translate(0," + height + ") rotate(-90)")
            .text("Total Number of Medals Won");
        
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

        var dv_tooltip = d3.select('#Overall')
            .append('div')
            .attr('class', 'tooltip')
            .style('display', 'none');
        
        function dv_onMouseOver() {
            d3.select(this)
            .attr("r", 10)
            .transition()
            .duration(200)
            .style("opacity", 1.85);
            
            // set color to orange for hover display
            var d = d3.select(this).data()[0]
            var html = "<span style = 'font-size:15px;font-family:Arial;font-weight: bold;color:#2BAE66'><b> Country: </b>" + d.toString().split(",")[0] + "</span></br>" +
            "<span style = 'font-size:12px;font-family:Arial;font-weight: bold;color:#EE4E34'><b> Total Medals: </b>" + parseInt(d.toString().split(",")[1]) + "</span>";
            
            dv_tooltip
            .style('display', 'inline')
            .html(html)
            .style('position', "absolute")
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY + 10) + 'px')
            .style('width', 100)
            .style('height', 80)
            .style('background', function(){ return("white"); });            

        }

        function dv_OnMouseOut() {
            d3.select(this).attr("r", 4);
            dv_tooltip.style('display', 'none');
        }

        // Adding Annotation Code here
        var cntName = "USA";
        var usaMedals = parseInt(sortableCntList[0].toString().split(",")[1]);

        const annotations = [
            {
                note: {
                    label: "" + cntName + " : " + usaMedals + " ",
                    lineType: "none",
                    bgPadding: {"top": 10, "left": 10, "right": 10, "bottom": 10},
                    title: "Highest Number Of Medals Won",
                    orientation: "leftRight",
                    "align": "middle",
                },
                type: d3.annotationCalloutElbow,
                connector: { end: "arrow" },
                subject: {radius: 5},
                x: x + 5,
                y: y + usaMedals,
                dx: "60",
                dy: "60",
                color: "blue"
            },
        ];

        const calloutWithArrow = d3.annotationCustomType(d3.annotationCalloutElbow, {
            connector: { end: "arrow" },
          });

        const makeAnnotations = d3.annotation().annotations(annotations);

        const annotationGroup = d3.select("svg")
                                .append("g")
                                .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
                                .attr("class", "annotation-group")
                                .call(makeAnnotations);

        // Modify the annotation element's style
        annotationGroup.selectAll(".annotation-note-label")

        d3.select("svg")
            .append("g")
            .attr("transform",
                "translate(" + margins.left + "," + margins.top + ")")
            .attr("class", "annotation-group")
            .call(makeAnnotations)

        // Annotation code ends here

    }
}