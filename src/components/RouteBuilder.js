import React, {useEffect, useState} from 'react';
import { Placemark, Polyline } from 'react-yandex-maps';
import { getBezierCurve } from '../utils';


export default ({points, onPlaceMarkDrag, onPlacmarkDbClick, pointerIndex}) => {
	const [bezeir, setBezier] = useState(points);
	const [pointer, setPointer] = useState([]);

	useEffect(() => {
		if(points.length > 0) {
			setBezier(getBezierCurve(points, 0.01));
			setPointer(points[0]);
		}
	}, points);

	return <>
		{ points.map((placemark, index) => <Placemark
			key={`${placemark[0]}__${placemark[1]}__${index}`}
			options={{draggable: true}}
			onDragEnd={(e) => onPlaceMarkDrag(e, index)}
			onDblclick={(e) => onPlacmarkDbClick(e, index)}
			geometry={placemark}/>)}
		{pointer.length !== 0 &&
			<Placemark geometry={bezeir[pointerIndex]} options={{preset: 'islands#circleIcon', iconColor: '#D9300C'}}/>}
		<Polyline
		geometry={points}
		options={{
			balloonCloseButton: false,
			strokeColor: '#99ff33',
			strokeWidth: 2,
			strokeStyle: 'dash',
		}}/>
		<Polyline
			geometry={bezeir}
			options={{
				balloonCloseButton: false,
				strokeColor: '#ff5733',
				strokeWidth: 5,
				strokeStyle: 'dash',
			}}/>
		{bezeir.length > 0 && <Polyline
			geometry={bezeir.slice(0, pointerIndex)}
			options={{
				balloonCloseButton: false,
				strokeColor: '#FFD733',
				strokeWidth: 4,
				strokeOpacity: 0.5,
				editorMaxPoints: 20,
			}}/>}
		</>
}