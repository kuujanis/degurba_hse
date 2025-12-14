import { useCallback, useMemo, useRef, useState } from 'react'
import {Layer, Map, Source, type LayerProps, type MapGeoJSONFeature, type MapLayerMouseEvent, type MapRef} from '@vis.gl/react-maplibre';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend as LegendChart, LinearScale, Title, Tooltip, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import Swicth from '@mui/material/Switch'
import { Legend } from './Legend';
import './App.css'
import '/maplibre-gl/dist/maplibre-gl.css';

const apiKey = import.meta.env.VITE_API_KEY;

const App = () => {
  const mapRef = useRef<MapRef | null>(null)
  // const [volume,setVolume] = useState<boolean>(false)
  const [multiClass,setMultiClass] = useState<boolean>(false)
  const [selectedCell, setSelectedCell] = useState<MapGeoJSONFeature|null>(null)
  const [selectedMun, setSelectedMun] = useState<MapGeoJSONFeature|null>(null)
  const [selectedReg, setSelectedReg] = useState<MapGeoJSONFeature|null>(null)

  ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement, Title, LegendChart);

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

  const legendData = useMemo(() => {
    return multiClass ? [
      {code: '30', color: '#fe0000', degurba_class: 'city'},
      {code: '23', color: '#742602', degurba_class: 'dense town'},
      {code: '22', color: '#a87001', degurba_class: 'semi-dense town'},
      {code: '21', color: '#ffff00', degurba_class: 'suburban or peri-urban area'},
      {code: '13', color: '#385624', degurba_class: 'village'},
      {code: '12', color: '#aacd65', degurba_class: 'dispersed rural area'},
      {code: '12', color: '#cdf570', degurba_class: 'very dispersed rural area'},
    ] : [
      {code: '30', color: '#fe0000', degurba_class: 'city'},
      {code: '20', color: '#ffcc00', degurba_class: 'town and semi-dense area'},
      {code: '10', color: '#69b972', degurba_class: 'rural area'},
    ]
  },[multiClass])
  
    const munOptions : ChartOptions<'bar'> = useMemo(() => {return {
      indexAxis: 'x', // Vertical bars (default)
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
            text: 'Population'
          },
          grid: {
            color: '#737373',
            lineWidth: 1
          },
        },
        x: {
          beginAtZero: true,
          title: {
            display: false,
            text: 'DegUrba Class'
          }
        }
      }
    }},[]);

  const munLayer: LayerProps = useMemo(() => {
    return {
      id: 'municipal',
      type: 'fill',
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_muns_3857',
      paint: {
        'fill-color': 'black',
        'fill-opacity': 0.01
      }
    }
  },[])

  const munBorderLayer: LayerProps = useMemo(() => {
    return {
      id: 'municipalborder',
      type: "line",
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_muns_3857',
      paint: {
        'line-color': '#000000ff',
        'line-width': 0.1
      },
      minzoom: 6
    }
  },[])

  const backgroundLayer: LayerProps = useMemo(() => {
    return {
      id: 'background',
      type: 'fill',
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_regions_3857',
      paint: {
        'fill-color': '#cdf570',
        'fill-opacity': 1
      }
    }
  },[])
  const regLayer: LayerProps = useMemo(() => {
    return {
      id: 'region',
      type: 'fill',
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_regions_3857',
      paint: {
        'fill-color': '#000000ff',
        'fill-opacity': 0.1
      }
    }
  },[])

  const regBorderLayer: LayerProps = useMemo(() => {
    return {
      id: 'regionborder',
      type: "line",
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_regions_3857',
      paint: {
        'line-color': '#000000ff',
        'line-width': 0.3
      },
      minzoom: 3
    }
  },[])

  const cellLayer: LayerProps = useMemo(() => {
    return multiClass ? {
      id: 'cell',
      type: 'fill',
      soucre: 'vector',
      'source-layer': 'degurba_russia_2021_l1_l2_3857',
      paint: {
        'fill-color': [
          'match',
          ['get', 'l2_class'],
          'city',
          '#fe0000',
          'dense town',
          '#742602',
          'semi-dense town',
          '#a87001',
          'suburban area or peri-urban area',
          '#ffff00',
          'village',
          '#385624',
          'dispersed rural area',
          '#aacd65',
          'very dispersed rural area',
          '#cdf570',
          '#f200ffff',
        ],
        'fill-opacity': 1
      }
    } : {
      id: 'cell',
      type: 'fill',
      soucre: 'vector',
      'source-layer': 'degurba_russia_2021_l1_l2_3857',
      paint: {
        'fill-color': [
          'match',
          ['get', 'l1_class'],
          'city',
          '#fe0000',
          'town and semi-dense area',
          '#ffcc00',
          'rural area',
          '#69b972',
          '#f200ffff',
        ],
        'fill-opacity': 1
      }
    }
  },[multiClass])

  const regHighlight: LayerProps = useMemo(() => {
    return {
      id: 'regionhighlight',
      type: "line",
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_regions_3857',
      paint: {
        'line-color': '#000000ff',
        'line-width': 1.5
      },
      minzoom: 3,
      filter: ['==',['get','fid'], selectedReg?.properties.fid ?? '']
    }
  },[selectedReg])

  const munHighlight: LayerProps = useMemo(() => {
    return {
      id: 'munhighlight',
      type: 'fill',
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_muns_3857',
      paint: {
        'fill-color': 'black',
        'fill-opacity': 0.25
      },
      filter: ['==',['get','fid'],selectedMun?.properties.fid ?? '']
    }
  },[selectedMun])

  const cellHighlight: LayerProps = useMemo(() => {
    return {
      id: 'cellhighlights',
      type: 'line',
      soucre: 'vector',
      'source-layer': 'degurba_russia_2021_l1_l2_3857',
      paint: {
        'line-width': 4,
        'line-color': '#00e5ffff',
        'line-opacity': 1
      },
      filter: ['==',['get','fid'],selectedCell?.properties.fid ?? '']
    }
  },[selectedCell])

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    console.log(e.features && e.features)
    
    if (mapRef.current) {
      if (e.features) {
      e.features.map((feature:MapGeoJSONFeature) => {
        switch(feature.layer.id) {
          case 'cell':
            setSelectedCell(feature)
            console.log('cell',feature)
            break
          case 'municipal':
            setSelectedMun(feature)
            console.log('mun',feature)
            break
          case 'region':
            setSelectedReg(feature)
            console.log('region',feature)
            break  
        }
      })
    }
    
    }
    
  },[])


  return (
    <div className="main">
      <div className="info-panel">
        {selectedMun && selectedReg && <div style={{display:'flex', flexDirection: 'column', alignItems: 'left', gap: '10px', padding: '10px'}}>
          {selectedCell && 
            <div style={{textAlign: 'left'}}>
              <div style={{color: 'lightgrey', fontSize: '1rem', fontWeight: '900', marginTop: '10px'}}>
                Кластер DEGURBA {selectedCell.properties.core_name ?? ''}
              </div>
              <div style={{color: 'lightgrey', fontSize: '1rem', fontWeight: '900', margin: '10px'}}>
                Класс кластера: {selectedCell.properties.l2_class}
              </div>
              <div style={{color: 'lightgrey', fontSize: '1rem', fontWeight: '900', margin: '10px'}}>
                Численность населения: {(selectedCell.properties.population).toFixed()} чел.
              </div>
            </div>}
          <div className='info-title'>
            {selectedMun.properties.name}
          </div>
          <div style={{color: 'lightgrey', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px'}}>
            Численность населения по классам территорий: {selectedMun.properties.degurba_total} чел.
          </div>
          <div style={{height: 220, width: '90%'}}>
            <Bar id='mun'  data={munData} options={munOptions}/>
          </div>
          <div className='info-title'>{selectedReg.properties.region}</div>
          <div style={{color: 'lightgrey', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px'}}>Численность населения по классам территорий: {selectedReg.properties.degurba_total} чел.</div>
          <div style={{height: 220, width: '90%'}}>
            <Bar id='reg'  data={regData} options={munOptions}/>
          </div>
        </div>}
        {!selectedMun && !selectedReg && 
          <div style={{padding: '20px', color: 'white'}}>
            <h2>DegUrba Russia</h2>
            <p>
              DEGURBA (Degree of Urbanisation) — методика оценки уровня урбанизированности территорий. Разработана консорциумом в составе шести организаций, включая Европейскую комиссию, ОЭСР, институты системы ООН и Всемирный банк. В 2020 г. рекомендована статистической комиссией ООН в качестве  инструмента гармонизации международной статистики в области урбанизации.
            </p>
            <p>
              DEGURBA основана на сопоставлении территорий по плотности населения, представленной по ячейкам сетки размером 1 км, и включает два уровня детализации. На первом уровне выделяется три класса территорий: города (cities), малые города и средне-плотные территории (towns and semi-dense areas) и сельские территории (rural areas). На втором уровне малые города и средне-плотные территории и сельские территории дополнительно разбиваются на подклассы.
            </p>
          </div>

        }
        
      </div>
      <Map
        ref={mapRef}
          initialViewState={{
            longitude: 37.5,
            latitude: 55.7,
            zoom: 5,
          }}
          style={{position: 'relative',width: '65%', height: '100%', transition: 'width 0.5s ease'}}
          mapStyle={`https://api.maptiler.com/maps/f40a1280-834e-43de-b7ea-919faa734af4/style.json?key=${apiKey}`}
          interactiveLayerIds={['municipal','region','cell']}
          onClick={handleClick}
          attributionControl={false}
      >
        <div className="legend-panel" style={{top: '10px'}}>
          <div style={{fontSize: '0.9rem', textAlign: 'center'}}>
            Число классов
          </div>
          <div>
            3<Swicth value={multiClass} onChange={(e) => setMultiClass(e.target.checked)}/>7
          </div>
          <Legend legendData={legendData}/>
          
        </div>
        <div>

        </div>
        <Source id='background' type='vector' tiles={["http://127.0.01:3002/degurba_russia_2021_l2_regions_3857/{z}/{x}/{y}"]}>
          <Layer {...backgroundLayer}/>
        </Source>
        <Source id='cell' type='vector' tiles={["http://127.0.0.1:3002/degurba_russia_2021_l1_l2_3857/{z}/{x}/{y}"]}>
              <Layer {...cellLayer}/>
              <Layer {...cellHighlight}/>
        </Source>
        <Source id='municipal' promoteId={'fid'} type='vector' tiles={["http://127.0.0.1:3002/degurba_russia_2021_l2_muns_3857/{z}/{x}/{y}"]}>
            <Layer {...munLayer}/>
            <Layer {...munBorderLayer}/>
            <Layer {...munHighlight}/>
        </Source>
        <Source id='region' type='vector' promoteId={'fid'} tiles={["http://127.0.01:3002/degurba_russia_2021_l2_regions_3857/{z}/{x}/{y}"]}>
          <Layer {...regLayer}/>
          <Layer {...regBorderLayer}/>
          <Layer {...regHighlight}/>
        </Source>
        
      </Map>
    </div>
  ) 
}

export default App
