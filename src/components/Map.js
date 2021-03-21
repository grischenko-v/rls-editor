import React, {useRef, useState} from 'react';
import { Map, Placemark, Polyline, YMaps } from 'react-yandex-maps';
import { Droppable } from './Droppable';
import { globalToMap, removeByIndex } from '../utils';

const mapData = {
	center: [55.751574, 37.573856],
	zoom: 5,
};

export const RLSMap = ({
						   placemarks,
						   setPlacmarks,
						   setTargets,
						   start,
						   setPointerIndex,
						   pointerIndex,
						   simulationSpeed,
						   pointer,
						   setPointer,
						   bezeir,
						   selectedTarget,
						   setSelectedTarget,
						   targetsPoint,
						   setTargetsPoints,
					   }) => {
	const mapRef = useRef(null);

	React.useEffect(() => {
		if (start) {
			setTimeout(() => {
				if (pointerIndex < bezeir.length) {
					setPointer(bezeir[pointerIndex]);
					setPointerIndex(pointerIndex => pointerIndex + 1);
				}
			}, 1000 / simulationSpeed);
		}
	}, [start, bezeir, pointerIndex, simulationSpeed]);

	const onPlaceMarkDrag = (e, index) => {
		const position = {
			x: e.get('position')[0],
			y: e.get('position')[1],
		};
		const mapObject = mapRef.current
		const projection = mapObject.options.get('projection');
		const newPosition = globalToMap(projection, position, mapObject);
		setTargetsPoints(points => {
			const poitsCopy = { ...points };
			const copy = [...points[selectedTarget]];
			copy[index] = newPosition;
			poitsCopy[selectedTarget] = copy;
			return poitsCopy;
		})
	}

	const onPlacmarkDbClick = (e, index) => {
		if(index === 0) {
			console.warn('last point');
			return;
		}
		setTargetsPoints(points => {
			const pointsCopy = { ...points };
			const copy = [...points[selectedTarget]];
			const cutted = removeByIndex(copy, index);
			pointsCopy[selectedTarget] = cutted;
			return pointsCopy;
		});
	};

	React.useEffect(() => {
		if(targetsPoint[selectedTarget]) {
			setPlacmarks(targetsPoint[selectedTarget])
		}
	}, [targetsPoint]);

	const onMapClick = (e) => {
		if (selectedTarget) {
			const newPoint = e.get('coords');
			setTargetsPoints(points => {
				const copy = {...points};
				copy[selectedTarget].push(newPoint);
				return copy;
			});
		}
	}

	return <YMaps>
		<Droppable
			allowedDropEffect={'copy'}
			map={mapRef}
			setTargets={setTargets}
			setSelectedTarget={setSelectedTarget}
			setPlacmarks={setPlacmarks}
			setTargetsPoints={setTargetsPoints}>
			<Map defaultState={mapData}
				 width={800}
				 height={900}
				 onClick={onMapClick}
				 instanceRef={ref => {
					 ref && ref.behaviors.disable('dblClickZoom');
					 mapRef.current = ref;
				 }}>
				{placemarks.map((placemark, index) => <Placemark
					key={`${placemark[0]}__${placemark[1]}__${index}`}
					geometry={placemark}
					options={{draggable: true}}
					onDragEnd={(e) => onPlaceMarkDrag(e, index)}
					onDblclick={(e) => onPlacmarkDbClick(e, index)}/>)}
				{bezeir.length > 0 && <Polyline
					geometry={bezeir.slice(0, pointerIndex)}
					options={{
						balloonCloseButton: false,
						strokeColor: '#FFD733',
						strokeWidth: 4,
						strokeOpacity: 0.5,
						editorMaxPoints: 20,
					}}/>}
				{pointer.length !== 0 &&
				<Placemark geometry={pointer} options={{preset: 'islands#circleIcon', iconColor: '#D9300C'}}/>}
				<Polyline
					geometry={bezeir}
					options={{
						balloonCloseButton: false,
						strokeColor: '#ff5733',
						strokeWidth: 5,
						strokeStyle: 'dash',
					}}/>
			</Map>
		</Droppable>
	</YMaps>
}