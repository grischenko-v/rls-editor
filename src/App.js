import React, { useRef, useState } from 'react';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const targetTypes = ['Aircraft', 'Helicopter', 'Cruise missile', 'Drone'];
const mapData = {
	center: [55.751574, 37.573856],
	zoom: 5,
};

export const Draggable = ({name}) => {
	const [{opacity}, drag] = useDrag(() => ({
		type: 'draggable',
		item: {name},
		collect: (monitor) => ({
			opacity: monitor.isDragging() ? 0.4 : 1,
		}),
	}), [name]);
	return (<div ref={drag} style={{opacity}}>
		{name}
	</div>);
};

export const Droppable = ({allowedDropEffect, children, map, setPlacmarks, setTargets}) => {
	const [_, drop] = useDrop(() => ({
		accept: 'draggable',
		drop: (item, monitor) => {
			setTargets(targets => {
				const count = targets.filter(target => target.indexOf(item.name) !== -1).length;
				return [...targets, `${item.name}_${count}`];
			});
			const projection = map.current.options.get('projection');
			const mapObject = map.current
			const position = monitor.getClientOffset();
			const newPlacemark = projection.fromGlobalPixels(mapObject.converter.pageToGlobal([position.x, position.y]),
				mapObject.getZoom())
			setPlacmarks((placemarks) => [...placemarks, newPlacemark])
		},
	}), [allowedDropEffect]);
	return (<div ref={drop}>
		{children}
	</div>);
};

const RLSMap = ({placemarks, setPlacmarks, setTargets}) => {
	const mapRef = useRef(null);

	return <Droppable allowedDropEffect={'copy'} map={mapRef} setPlacmarks={setPlacmarks} setTargets={setTargets}>
		<Map defaultState={mapData}
			 width={800}
			 height={900}
			instanceRef={mapRef}>
			{placemarks.map(placemark => <Placemark key={`${placemark[0]}__${placemark[1]}`} geometry={placemark}/>)}
		</Map>
	</Droppable>
}

const App = () => {
	const [placemarks, setPlacmarks] = useState([]);
	const [targets, setTargets] = useState([]);

	return (<DndProvider backend={HTML5Backend}>
			<div className='wrapper'>
				<div className='menu-wrapper'>
					<h3>Target types</h3>
					<ul className='list'>
						{targetTypes.map(item => <li
							key={item}
							className='list-item'>
							<Draggable name={item}/>
						</li>)}
					</ul>
					<h3>Targets</h3>
					<ul className='list'>
						{targets.map(item => <li key={item} className='list-item'>{item}</li>)}
					</ul>
				</div>
				<div >
					<YMaps>
						<RLSMap placemarks={placemarks} setPlacmarks={setPlacmarks} setTargets={setTargets}/>
					</YMaps>
				</div>
			</div>
		</DndProvider>
	)
}

export default App;
