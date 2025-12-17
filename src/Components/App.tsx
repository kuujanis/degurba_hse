import { useCallback, useMemo, useRef, useState } from 'react'
import {Layer, Map, Source, type LayerProps, type MapGeoJSONFeature, type MapLayerMouseEvent, type MapRef} from '@vis.gl/react-maplibre';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend as LegendChart, LinearScale, Title, Tooltip } from "chart.js";
import './App.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import { InfoSection } from './Info';
import type { ColorSpecification, DataDrivenPropertyValueSpecification } from 'maplibre-gl';
import { LegendPanel } from './LegendPanel/LegendPanel';
import { Dashboard } from './Dashboard/Dashboard';

const L2_paint: DataDrivenPropertyValueSpecification<ColorSpecification> = [
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
        ]
const L1_paint: DataDrivenPropertyValueSpecification<ColorSpecification> = [
          'match',
          ['get', 'l1_class'],
          'city',
          '#fe0000',
          'town and semi-dense area',
          '#ffcc00',
          'rural area',
          '#69b972',
          '#f200ffff',
        ]
const BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiKey = import.meta.env.VITE_API_KEY;

const App = () => {
  const mapRef = useRef<MapRef | null>(null)
  const [volume,setVolume] = useState<boolean>(false)
  const [multiClass,setMultiClass] = useState<boolean>(true)
  const [selectedCell, setSelectedCell] = useState<MapGeoJSONFeature|null>(null)
  const [selectedMun, setSelectedMun] = useState<MapGeoJSONFeature|null>(null)
  const [selectedReg, setSelectedReg] = useState<MapGeoJSONFeature|null>(null)

  ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement, Title, LegendChart);



  const munLayer: LayerProps = useMemo(() => {
    return {
      id: 'municipal',
      type: 'fill',
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_muns_3857',
      'beforeId':'Lake labels',
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
      'beforeId':'Lake labels',
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
      'beforeId':'Lake labels',
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
      'beforeId':'Lake labels',
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
      'beforeId':'Lake labels',
      paint: {
        'line-color': '#000000ff',
        'line-width': 0.3
      },
      minzoom: 3
    }
  },[])

  const cellExtrusionLayer: LayerProps = useMemo(() => {
    return  {
      id: 'cell',
      type: 'fill-extrusion',
      soucre: 'vector',
      'source-layer': 'degurba_russia_2021_l1_l2_3857',
      'beforeId':'Lake labels',
      paint: {
        'fill-extrusion-color': multiClass ? L2_paint : L1_paint,
        'fill-extrusion-height': volume ? [
              'interpolate',
              ['linear'],
              ['zoom'],
              3,
              0,
              5,
              ['*',['/',['get','population'],['get','area']],2]
            ] : 0,
        'fill-extrusion-opacity': 1
      }
    }
  },[multiClass, volume])

  const regHighlight: LayerProps = useMemo(() => {
    return {
      id: 'regionhighlight',
      type: "line",
      source: 'vector',
      'source-layer': 'degurba_russia_2021_l2_regions_3857',
      'beforeId':'Lake labels',
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
      'beforeId':'Lake labels',
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
      beforeId:'Lake labels',
      paint: {
        'line-width': 4,
        'line-color': '#00e5ffff',
        'line-opacity': 1
      },
      filter: ['==',['get','fid'],selectedCell?.properties.fid ?? '']
    }
  },[selectedCell])

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    console.log(e)

    if (mapRef.current) {
      console.log(mapRef.current.getStyle())
      if (e.features) {
      e.features.map((feature:MapGeoJSONFeature) => {
        switch(feature.layer.id) {
          case 'cell':
            setSelectedCell(feature)
            console.log('cell',feature.geometry.coordinates.flat().length)
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
        {selectedMun && selectedReg && 
          <Dashboard
            selectedCell={selectedCell}
            selectedMun={selectedMun}
            selectedReg={selectedReg}
            multiClass={multiClass}
          />
        }
        {!selectedMun && !selectedReg && 
          <InfoSection/>
        }
        
      </div>
      <Map
        ref={mapRef}
          initialViewState={{
            longitude: 37.5,
            latitude: 55.7,
            zoom: 5,
          }}
          style={{position: 'relative',width: '65%', height: '100%', transition: 'width 0.5s ease', flex: 1}}
          mapStyle={`https://api.maptiler.com/maps/019b2242-52c9-78b5-bc93-73ba9aab5ea4/style.json?key=${apiKey}`}
          interactiveLayerIds={['municipal','region','cell']}
          onClick={handleClick}
      >
        <LegendPanel multiClass={multiClass} setMultiClass={setMultiClass} volume={volume} setVolume={setVolume}/>
        <Source id='background' type='vector' tiles={[BASE_URL+"degurba_russia_2021_l2_regions_3857/{z}/{x}/{y}"]}>
          <Layer {...backgroundLayer}/>
        </Source>
        <Source id='cell' type='vector' tiles={[BASE_URL+"degurba_russia_2021_l1_l2_3857/{z}/{x}/{y}"]}>
              <Layer {...cellExtrusionLayer}/>
              <Layer {...cellHighlight}/>
        </Source>
        <Source id='municipal' promoteId={'fid'} type='vector' tiles={[BASE_URL+"degurba_russia_2021_l2_muns_3857/{z}/{x}/{y}"]}>
            <Layer {...munLayer}/>
            <Layer {...munBorderLayer}/>
            <Layer {...munHighlight}/>
        </Source>
        <Source id='region' type='vector' promoteId={'fid'} tiles={[BASE_URL+"degurba_russia_2021_l2_regions_3857/{z}/{x}/{y}"]}>
          <Layer {...regLayer}/>
          <Layer {...regBorderLayer}/>
          <Layer {...regHighlight}/>
        </Source>
        
      </Map>
    </div>
  ) 
}

export default App
