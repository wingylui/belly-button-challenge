// improting json file and using the data 
// D3 cannot store into a variable, data inside should be used in the function(data))
d3.json("./samples.json").then(function(data){
 
    // selecting the dropdownlist
    let dropDown = d3.select("#selDataset");
    // replace the droplist with names in the json file
    for (let item = 0; item < data.names.length; item++){
        dropDown.append("option").attr("value", data.names[item]).text(data.names[item]);
    }
});

// create inital page
dataAndrestyle(940);


// identifying the id inside the dropdown list and updating graph and information
function optionChanged(updateID){
    dataAndrestyle(updateID);
}


// function for creating all the graphs in the HTML page
function dataAndrestyle(ID){

    d3.json("./samples.json").then(function(data){
        let metaData = []; // create an empty array for storing the select id metadata
        for (let i = 0; i < data.metadata.length; i++) {
            // searching the selected dataset (from metadata)
            if (ID == data.metadata[i].id){
                // storing the dataset
                metaData = data.metadata[i];
                console.log(metaData);

                break;
            }
        }
        // remove the dsiplaying information before updating new info
        d3.selectAll(".no-bullets").selectAll("li").remove();

        // metaData information will be display in the ul list (class = no-bullets)
        let demographicInfo = d3.select(".no-bullets");

        // putting all the info into different variable and then adding into the ul list
        var id = "id: " + metaData.id;
        var ethnicity = "ethnicity: " + metaData.ethnicity;
        var gender = "gender: " + metaData.gender;
        var age = "age: " + metaData.age;
        var location = "location: " + metaData.location;
        var bbtype = "bbtype: " + metaData.bbtype;
        var wfreq = "wfreq: " + metaData.wfreq;
        demographicInfo.append("li").text(id);
        demographicInfo.append("li").text(ethnicity);
        demographicInfo.append("li").text(gender);
        demographicInfo.append("li").text(age);
        demographicInfo.append("li").text(location);
        demographicInfo.append("li").text(bbtype);
        demographicInfo.append("li").text(wfreq);
    

        let barDataset = []; // create an empty array for storing data for bar chart
        let bubbleDataset = []; // create an empty array for storing data for bubble chart
        // using updategraph function when there is a change on the dropdown list
        for (let i = 0; i < data.samples.length; i++) {
            // searching the selected dataset (from samples)
            if (ID == data.samples[i].id){
                // storing dataset using map function
                dataset = data.samples[i];

                // pushing data into array
                for (let n = 0; n < dataset.sample_values.length; n++) {
                    var otuID = "OTU " + dataset.otu_ids[n];
                    barDataset.push({
                        otu_ids: otuID,
                        otu_labels: dataset.otu_labels[n],
                        sample_values: dataset.sample_values[n]
                    });
                    bubbleDataset.push({
                        otu_ids: dataset.otu_ids[n],
                        otu_labels: dataset.otu_labels[n],
                        sample_values: dataset.sample_values[n]
                    });
                }
                
                break;
            }
        }
        // sort (descending) and indentify the top10 otu (using slice function)
        let sortedOtu = barDataset.sort((a, b) => d3.descending(a.sample_values, b.sample_values));
        let topTen = sortedOtu.slice(0,10).reverse();

        // drawing bar chart
        var barTrace = [{
            x: topTen.map(sampleValue => sampleValue.sample_values),
            y: topTen.map(otu => otu.otu_ids), 
            text: topTen.map(label => label.otu_labels), // for hover text
            type: "bar",
            marker: {
                color: "rgb(94, 149, 169)",
                opacity: 0.7, // transparent
                line: {
                    width: 1.5,
                    color: "rgb(55, 116, 145)"} // line colour and width
            },
            orientation: "h" // change vertical to horizontial
        }];

        var barLayout = {
            showlegend: false,
            height: 650,
            width: 500
        };

        // plot bar chart
        Plotly.newPlot("bar", barTrace, barLayout);
        
        // drawing bubble chart
        var bubbleTrace = [{
            x: bubbleDataset.map(otu => otu.otu_ids),
            y: bubbleDataset.map(sampleValue => sampleValue.sample_values),
            text: bubbleDataset.map(label => label.otu_labels), // hover text
            mode: "markers",
    
            marker: {
                color: bubbleDataset.map(otu => otu.otu_ids), // bubble colour
                size: bubbleDataset.map(sampleValue => sampleValue.sample_values) //bubble size
            }
        }];

        var bubbleLayout ={
            showlegend: false,
            xaxis: {title: "OTU ID"},
            height: 600,
            width: 1200
        };
        // plot bubble chart
        Plotly.newPlot("bubble", bubbleTrace, bubbleLayout);


        // drawing gauge chart
        var gaugeData = [
            {
                type: "indicator", 
                mode: "gauge+number",
                title: {text: "scrubs per week"},
                gauge:{
                    axis: {range: [0, 9]},
                    bar: {color: "rgb(46, 74, 90)"}, // change bar colour
                    // seperate 0 to 9 into 9 sections
                    steps: [
                        {range: [0, 1], color: "rgb(203, 236, 235)"},
                        {range: [1, 2], color: "rgb(180, 219, 220)"},
                        {range: [2, 3], color: "rgb(158, 201, 207)"},
                        {range: [3, 4], color: "rgb(136, 184, 194)"},
                        {range: [4, 5], color: "rgb(114, 167, 181)"},                    
                        {range: [5, 6], color: "rgb(94, 149, 169)",},
                        {range: [6, 7], color: "rgb(74, 132, 157)"},
                        {range: [7, 8], color: "rgb(55, 116, 145)"},
                        {range: [8, 9], color: "rgb(35, 99, 133)"}             
                    ],

                },
                value: metaData.wfreq // display the value
            }
        ];

        // arrow angle calculation 
        var value = metaData.wfreq / 9 * 180;
        var r = 0.4;
        var degree = 180 - value;
        var x_head = r * Math.cos(Math.PI/180*degree);
        var y_head = r * Math.sin(Math.PI/180*degree);


        let gaugeLayout = {
            title: {
                text: "<b>Belly Button Washing Frequency</b>", // bold title
                font: {size: 25}
            },
            xaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
            yaxis: {range: [0, 1], showgrid: false, 'zeroline': false, 'visible': false},
            showlegend: false,
            annotations: [{
                // locating the arrow into right position
                ax: 0.5,
                ay: 0.23,
                axref: 'x',
                ayref: 'y',
                x: 0.5 + x_head,
                y: 0.23 + y_head,
                xref: 'x',
                yref: 'y',
                // arrow colour and size and display arrow
                showarrow: true,
                arrowhead: 9,
                arrowsize: 1.5,
                arrowcolor: "rgb(6, 60, 91)"
            }]
        };
        // plot the gauge chart
        Plotly.newPlot("gauge", gaugeData, gaugeLayout);
    });
}
