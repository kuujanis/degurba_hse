import './Legend.css'
interface ILegendItem {
    code: string;
    color: string;
    degurba_class: string;    
}
interface ILegendProps {
    legendData: ILegendItem[]
}
export const Legend = ({legendData}:ILegendProps) => {
    return (
        <div className="legend-column">
            {legendData.map((f:ILegendItem,i:number) => {
                return (
                    <div className="legend-row" key={i}>
                        <div>{f.code}</div>
                        <div className="color-facet" style={{backgroundColor: f.color}}/>
                        <div>{f.degurba_class}</div>
                    </div>
                )
            })}
        </div>
    )
}