import { useMemo, type Dispatch, type SetStateAction } from "react"
import { Legend } from "./Legend"
import Swicth from '@mui/material/Switch'
import './Legend.css'

interface iLegendPanel {
    multiClass: boolean;
    volume: boolean;
    setMultiClass: Dispatch<SetStateAction<boolean>>;
    setVolume: Dispatch<SetStateAction<boolean>>;
}

export const LegendPanel = ({multiClass,volume,setMultiClass,setVolume}:iLegendPanel) => {
    const legendData = useMemo(() => {
        return multiClass ? [
          {code: '30', color: '#fe0000', degurba_class: 'city'},
          {code: '23', color: '#742602', degurba_class: 'dense town'},
          {code: '22', color: '#a87001', degurba_class: 'semi-dense town'},
          {code: '21', color: '#ffff00', degurba_class: 'suburban or peri-urban area'},
          {code: '13', color: '#385624', degurba_class: 'village'},
          {code: '12', color: '#aacd65', degurba_class: 'dispersed rural area'},
          {code: '11', color: '#cdf570', degurba_class: 'very dispersed rural area'},
        ] : [
          {code: '30', color: '#fe0000', degurba_class: 'city'},
          {code: '20', color: '#ffcc00', degurba_class: 'town and semi-dense area'},
          {code: '10', color: '#69b972', degurba_class: 'rural area'},
        ]
      },[multiClass])

    return (
        <div className="legend-container" >
            <div className="legend-panel">
                <div style={{fontSize: '0.9rem', textAlign: 'center'}}>
                    Плотность населения
                </div>
                <div className="volume-handle">
                    <img src="public/2d.svg"/>
                    <Swicth 
                        checked={volume} onChange={(e) => setVolume(e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase': {
                                // Track when checked - use + for sibling
                                '&.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#00e5ff', // This will work!
                                },
                                '&.Mui-checked': {
                                    '& .MuiSwitch-thumb': {
                                    backgroundColor: '#00e5ff',
                                    },
                                },
                            },
                            '& .MuiSwitch-track': {
                            backgroundColor: '#051b74', // Custom track color when unchecked
                            opacity: 1,
                            },
                            
                        }}
                    />
                    <img src="public/degurba.svg"/>
                </div>
            </div>
            <div className="legend-panel">
                <div style={{fontSize: '0.9rem', textAlign: 'center'}}>
                    Число классов
                </div>
                <div>
                    III<Swicth 
                        checked={multiClass} onChange={(e) => setMultiClass(e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase': {
                                // Track when checked - use + for sibling
                                '&.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#00e5ff', // This will work!
                                },
                                '&.Mui-checked': {
                                    '& .MuiSwitch-thumb': {
                                    backgroundColor: '#00e5ff',
                                    },
                                },
                            },
                            '& .MuiSwitch-track': {
                            backgroundColor: '#051b74', // Custom track color when unchecked
                            opacity: 1,
                            },
                            
                        }}
                    />VII
                </div>
                <Legend legendData={legendData}/>       
            </div>     
        </div>
    )
}