import React, {useRef, useState} from 'react';
import { Map, Placemark, Polyline, YMaps } from 'react-yandex-maps';
import { Droppable } from './Droppable';
import { globalToMap, removeByIndex } from '../utils';
import RouteBuilder from './RouteBuilder';

const mapData = {
	center: [55.751574, 37.573856],
	zoom: 5,
};

export const RLSMap = ({
						   setTargets,
						   start,
						   setPointerIndex,
						   pointerIndex,
						   simulationSpeed,
						   selectedTarget,
						   setSelectedTarget,
						   targetsPoint,
						   setTargetsPoints,
					   }) => {
	const mapRef = useRef(null);

	React.useEffect(() => {
		if (start) {
			setTimeout(() => {
				if (pointerIndex < 100) {
					setPointerIndex(pointerIndex => pointerIndex + 1);
				}
			}, 1000 / simulationSpeed);
		}
	}, [start, pointerIndex, simulationSpeed]);

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
			setTargetsPoints={setTargetsPoints}>
			<Map defaultState={mapData}
				 width={800}
				 height={900}
				 onClick={onMapClick}
				 onContextmenu={() => setSelectedTarget('')}
				 instanceRef={ref => {
					 ref && ref.behaviors.disable('dblClickZoom');
					 mapRef.current = ref;
				 }}>
				{Object.keys(targetsPoint).map(item => targetsPoint[item]).map((points, routeIndex) => {
					return (<RouteBuilder
						pointerIndex={pointerIndex}
						points={points}
						onPlaceMarkDrag={onPlaceMarkDrag}
						onPlacmarkDbClick={onPlacmarkDbClick}
						key={`route__${routeIndex}__${points.length}`}
						simulationSpeed={simulationSpeed}
						start={start}/>);
				})}
			</Map>
		</Droppable>
	</YMaps>
}