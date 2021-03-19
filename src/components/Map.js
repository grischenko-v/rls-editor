import React, { useRef, useState } from 'react';
import { getBezierCurve } from '../utils';
import { Map, Placemark, Polyline, YMaps } from 'react-yandex-maps';
import { Droppable } from './Droppable';

const mapData = {
	center: [55.751574, 37.573856],
	zoom: 5,
};

export const RLSMap = ({placemarks, setPlacmarks, setTargets, start, setPointerIndex, pointerIndex, simulationSpeed, pointer, setPointer}) => {
	const mapRef = useRef(null);
	const [bezeir, setBezier] = useState([]);

	React.useEffect(() => {
		setBezier(getBezierCurve(placemarks, 0.01));

		if(!pointer) {
			setPointer(placemarks[0]);
		}
	}, [placemarks]);

	React.useEffect(() => {
		if(start) {
			setTimeout(() => {
				if( pointerIndex < bezeir.length) {
					setPointer(bezeir[pointerIndex]);
					setPointerIndex(pointerIndex => pointerIndex + 1);
				}
			}, 1000/simulationSpeed);
		}
	}, [start, bezeir, pointerIndex, simulationSpeed]);

	return <YMaps>
		<Droppable allowedDropEffect={'copy'} map={mapRef} setPlacmarks={setPlacmarks} setTargets={setTargets}>
			<Map defaultState={mapData}
				 width={800}
				 height={900}
				 instanceRef={mapRef}>
				{placemarks.map(placemark => <Placemark key={`${placemark[0]}__${placemark[1]}`} geometry={placemark}/>)}
				<Polyline
					geometry={bezeir.slice(0, pointerIndex)}
					options={{
						balloonCloseButton: false,
						strokeColor: '#FFD733',
						strokeWidth: 4,
						strokeOpacity: 0.5,
					}}
				/>
				{pointer.length !== 0 && <Placemark geometry={pointer} options={{preset: 'islands#circleIcon', iconColor: '#D9300C'}}/>}
				<Polyline
					geometry={bezeir}
					options={{
						balloonCloseButton: false,
						strokeColor: '#ff5733',
						strokeWidth: 2,
						strokeStyle: 'dash',
					}}
				/>
			</Map>
		</Droppable>
	</YMaps>
}