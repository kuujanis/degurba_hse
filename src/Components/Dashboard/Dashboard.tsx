import { Bar } from "react-chartjs-2";
import { getClassPaint, spacePopNumber } from "../../utils"
import { GeomSVG } from "../GeomSVG"
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import './Dashboard.css'

interface IDashboard {
    selectedReg: MapGeoJSONFeature;
    selectedMun: MapGeoJSONFeature;
    selectedCell: MapGeoJSONFeature|null;
    multiClass: boolean;
}

export const Dashboard = ({selectedReg,selectedMun,selectedCell,multiClass}:IDashboard) => {
    const munData = useMemo(() => {
          const properties = selectedMun?.properties
          return {
            labels: multiClass ? ['30','23','22','21','13','12', '11'] : ['30','20','10'],
            datasets: [
              {
                label: 'Население',
                data: properties ? (multiClass ? [
                  properties.degurba_30, properties.degurba_23, properties.degurba_22, properties.degurba_21,
                  properties.degurba_13, properties.degurba_12, properties.degurba_11
                ] : [properties.degurba_30,properties.degurba_20,properties.degurba_10]) : [0,0,0,0,0,0,0],
                backgroundColor: multiClass ? 
                  ['#fe0000','#742602','#a87001','#ffff00','#385624','#aacd65','#cdf570'] : 
                  ['#fe0000','#ffcc00','#69b972'],
                borderColor: '#ffffff', // Black borders
              },
            ],
          }
    }, [selectedMun, multiClass])
    
    const regData = useMemo(() => {
          const properties = selectedReg?.properties  
          return {
            labels: multiClass ? ['30','23','22','21','33','32', '31'] : ['30','20','10'],
            datasets: [
              {
                label: 'Население',
                data: properties ? (multiClass ? [
                  properties.degurba_30, properties.degurba_23, properties.degurba_22, properties.degurba_21,
                  properties.degurba_13, properties.degurba_12, properties.degurba_11
                ]:[properties.degurba_30,properties.degurba_20,properties.degurba_10]) : [0,0,0,0,0,0,0],
                backgroundColor: multiClass ? ['#fe0000','#742602','#a87001','#ffff00','#385624','#aacd65','#cdf570'] : 
                  ['#fe0000','#ffcc00','#69b972'],
                borderColor: '#ffffff', // Black borders
              },
            ],
          }
    }, [selectedReg,multiClass])
       
    const munOptions : ChartOptions<'bar'> = useMemo(() => {return {
          indexAxis: 'x', // Vertical bars (default)
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            // title: {
            //     display: true,
            //     text: 'Распределение по классам DEGURBA',
            //     font: {
            //         size: 14,
            //     },
            //     color: 'rgb(210, 210, 210)',
            // },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Численность населения',
                color: 'rgb(210, 210, 210)'
              },
              grid: {
                color: '#737373',
                lineWidth: 1
              },
              ticks: {
                color: 'rgb(210, 210, 210)'
              }
            },
            x: {
              beginAtZero: true,
              title: {
                display: false,
                text: 'Класс',
                color: 'rgb(210, 210, 210)'
              },
              ticks: {
                color: 'rgb(210, 210, 210)'
              }
            }
          }
    }},[]);

    const l_class:string = multiClass ? selectedCell?.properties.l2_class : selectedCell?.properties.l1_class
    const color = getClassPaint(l_class)

    return (
        <div style={{color: 'lightgrey', display:'flex', flexDirection: 'column', alignItems: 'left', gap: '10px', padding: '10px', overflowY: 'scroll'}}>
                  {selectedCell && 
                    <div className="cell-panel">
                        <div className="cell-stat-column">
                            <div>
                                Кластер DEGURBA {selectedCell.properties.core_name ?? ''}
                            </div>  
                            <div>
                                Класс кластера: <span style={{backgroundColor:color}}>{selectedCell.properties.l2_class}</span>
                            </div>
                            <div>
                                Численность населения: {spacePopNumber((selectedCell.properties.population).toFixed())} чел.
                            </div>
                            <div>
                                Плотность населения: {spacePopNumber((selectedCell.properties.population/selectedCell.properties.area).toFixed(1))} чел./км²
                            </div>
                        </div>
                        <GeomSVG selectedCell={selectedCell} multiClass={multiClass} width={70} height={70}/>
                    </div>}
                  <div className='stat-title'>
                    {selectedMun.properties.name}
                  </div>
                  <div>
                    Численность населения: {spacePopNumber(selectedMun.properties.degurba_total)} чел.
                  </div>
                  <div>
                    По классам DEGURBA:
                  </div>
                  <div style={{height: 220, width: '90%'}}>
                    <Bar id='mun'  data={munData} options={munOptions}/>
                  </div>
                    <div className='stat-title'>{selectedReg.properties.region}</div>
                    <div>
                        Численность населения: {spacePopNumber(selectedReg.properties.degurba_total)} чел.
                    </div>
                    <div>
                        По классам DEGURBA:
                    </div>
                    <div style={{height: 220, width: '90%'}}>
                        <Bar id='reg'  data={regData} options={munOptions}/>
                    </div>
                </div>
    )
}