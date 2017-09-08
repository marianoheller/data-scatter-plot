import React, { Component } from 'react';
import './ScatterPlot.css';
import dataJson from  '../dataset.json';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import d3Legend from 'd3-svg-legend';


export default class ScatterPlotContainer extends Component {

    loadData() {
        const parseTime = (time) => time.split(":")
        .map(Number)
        .reverse()
        .reduce( (acc, t,i) => acc+t*60 );

        return dataJson.map( (d) => {
            return {
                ...d,
                Seconds: parseTime(d.Time),
            }
        } );
    }

    render() {
        const size = {
            width: 1000, 
            height: 500,
            margin: {
                top: 50,
                right: 10,
                bottom: 20,
                left: 40,
            },
        };

        return (
            <div>
                <ScatterPlot data={this.loadData()} size={ size }/>
            </div>
        )
    }
}



class ScatterPlot extends Component {


    constructor(props){
      super(props)
      this.createScatterPlot = this.createScatterPlot.bind(this)
    }

    componentDidMount() {
            this.createScatterPlot()
    }

    componentDidUpdate() {
            this.createScatterPlot()
    }

    
    createScatterPlot() {
        const { height, width, margin } = this.props.size;
        const { data } = this.props;


        //Padding helper function
        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        //Data label formatter ( for y axis )
        const createTimeLabel = (timeString) => {
            const mins = Math.floor(timeString/60);
            const secs = timeString%60;
            return `${pad(mins,2)}:${pad(secs,2)}`;
        };

        //Create SVG
        const svg = d3.select("#chartContainer")
        .append("svg")
        .attr("height", height)
        .attr("width", width );


        //Tooltip init
        const tip = d3Tip()
        .attr("id", "tooltip")
        .html( (d) => {
            return `
            Time: ${d.Time}<br>
            Year: ${d.Year}`;
        });
        svg.call(tip);


        // Y Scale
        const minTime = new Date( d3.min( data.map( (d) => d.Seconds )) );
        const maxTime = new Date( d3.max( data.map( (d) => d.Seconds )) );
        const dataHeight = height - margin.top - margin.bottom;
        const yScale = d3.scaleLinear()
        .domain( [minTime, maxTime] )
        .range( [0, dataHeight] );


        //X Scale
        const minYear = d3.min( data.map( (d) => d.Year ) );
        const maxYear = d3.max( data.map( (d) => d.Year ) );
        const dataWidth = width - margin.left - margin.right;
        const xScale = d3.scaleLinear()
        .domain( [minYear-1, maxYear+1])
        .range( [0, dataWidth] );


        //Title
        const middleData = (width - margin.left - margin.right)/2
        svg.append("text")
        .attr("id", "title")
        .attr("text-anchor", "middle")
        .attr("transform", `translate( ${middleData+margin.left} ,${margin.top/2})`)
        .text("Doping in Professional Bicycle Racing");


        //Legend
        const dataTypes = data.reduce( (acc, d) => {
            const dataType = d.Doping ? {
                text: "Doped",
                class: "doped",
                color: "red",
            } : {
                text: "Didn't dope",
                class: "nonDoped",
                color: "teal",
            };
            const isLegend = acc.filter( (a) => a.class === dataType.class ).length === 0;
            if ( isLegend ) acc.push(dataType);
            return acc;
        } , []);

        const ordinal = d3.scaleOrdinal()
        .domain( dataTypes.map( (d) => d.text) )
        .range( dataTypes.map( (d) => d.color) );

        svg.append("g")
        .attr("id", "legend")
        .attr("class", "legendOrdinal")
        .attr("transform", `translate(${3*width/4}, ${height/4})`)

        const legendOrdinal = d3Legend.legendColor()
        .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
        .shapePadding(10)
        .scale(ordinal);

        svg.select(".legendOrdinal")
        .call(legendOrdinal);
              

        //X axis
        svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale)
        .tickFormat(d3.format(".4")));


        //Y axis
        svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .ticks(20)
            .tickFormat(createTimeLabel) );


        //Data dots
        svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .selectAll(".dot")
        .data(data)
        .enter()
            .append("circle")
            .attr("class", (d) => {
                const dopingClass =  d.Doping ? "doped" : "nonDoped";
                return "dot " + dopingClass;
            })
            .attr("cx", (d) => xScale(d.Year) )
            .attr("cy", (d) => yScale(d.Seconds) )
            .attr("r", 0)
            .attr("data-xvalue", (d) => d.Year )
            .attr("data-yvalue", (d) => {
                const timeArr = d.Time.split(":").map(Number);
                const now = new Date();
                now.setMinutes(timeArr[0], timeArr[1]);
                return now;
            } )
            .on("mouseover", (d, i) => {
                tip.attr("data-year", d.Year)
                return tip.show(d,i);
            } )
            .on( "mouseout", tip.hide )
            .transition()
                .duration(800)
                .attr("r", 6)
                .transition(200)
                    .attr("r", 5)

    }
    
    render() {

        return  (
            <div id="chartContainer" >
            </div>
        
        )
    }
}