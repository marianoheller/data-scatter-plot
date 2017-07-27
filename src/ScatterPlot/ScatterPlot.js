import React, { Component } from 'react';
import Chart from 'chart.js';
import './ScatterPlot.css';

import dataJson from  '../dataset.json';


export default class ScatterPlotContainer extends Component {

    parseTime( time ) {
        const timeArray = time.split(":");
        return new Date(0,0,0,0,timeArray[0], timeArray[1]);
    }

    loadData() {
        return dataJson.map( (d) => {
            return {
                ...d,
                TimeForChart: this.parseTime(d.Time),
                Time: d.Time,
                Place: parseInt(d.Place, 10),
            }
        })
    }

    render() {
        return (
            <div>
                <ScatterPlot data={this.loadData()} size={ {width: "200", height: "100"} }/>
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
        const node = this.node;
        const { data } = this.props;

        const doped = {
            pointBackgroundColor: `rgba(200, 0, 0, 0.5)`,
            pointBorderColor: `rgba(200, 0, 0, 0.9)`
        };
        const didntDoped = {
            pointBackgroundColor: `rgba(80, 250, 80, 0.5)`,
            pointBorderColor: `rgba(80, 250, 80, 0.9)`
        };

        const colors = data.reduce( (acc, d) => {
            if ( !acc.pointBackgroundColor ) { acc.pointBackgroundColor = [] }
            if ( !acc.pointBorderColor ) { acc.pointBorderColor = [] }
            if ( d.Doping ) {
                acc.pointBackgroundColor.push( doped.pointBackgroundColor );
                acc.pointBorderColor.push( doped.pointBorderColor );
            }
            else {
                acc.pointBackgroundColor.push( didntDoped.pointBackgroundColor );
                acc.pointBorderColor.push( didntDoped.pointBorderColor );
            }
            
            return acc;
        }, {} );

        return new Chart(node, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Professional Bicycle Racing Dataset',
                    pointBackgroundColor: colors.pointBackgroundColor,
                    pointBorderColor: colors.pointBorderColor,
                    data: data.map( (d) => {
                        return {
                            x: d.TimeForChart,
                            y: d.Place,
                        }
                    }),
                    pointRadius: 5,
                    fill: false,
                    showLine: false,
                }],
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            displayFormats: {
                                minute: 'mm:ss'
                            },
                            unit: 'minute',
                            minUnit: "minute",
                        }
                    }],
                },
                title: {
                    display: true,
                    text: 'Doping in Professional Bicycle Racing'
                },
                tooltips: {
                    callbacks: {
                        label: () => {
                            return "";
                        },
                        beforeLabel: ( tooltipItem, config) => {

                            const pad = function _pad(n, width=2, z) {
                                z = z || '0';
                                n = n + '';
                                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
                            }

                            const m = tooltipItem.xLabel.getMinutes();
                            const s = tooltipItem.xLabel.getSeconds();
                            const target = data.find( (d) => d.Time === `${pad(m)}:${pad(s)}` );
                            if ( !target )  { return `Error finding the target object. ${m}:${s}`}
                            
                            const label = [
                                target.Name,
                                `${target.Nationality}, ${target.Year}`,
                                target.Time                                
                            ];
                            if (target.Doping) {  label.push(target.Doping)  }
                            return label;
                        }
                    }
                }
            }
        });
    }
    
    render() {
        const { width, height } = this.props.size;
        console.log(width, height);

        return  (
            <div>
                <canvas 
                ref={node => this.node = node}
                id="myChart" 
                width={width} 
                height={height}
                ></canvas>
                <div className="legend">
                    {this.props.legend}
                </div>
            </div>
        
        )
    }
}