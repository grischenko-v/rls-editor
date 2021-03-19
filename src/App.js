import React, { useRef, useState } from 'react';
import { YMaps, Map, Placemark, Polyline } from 'react-yandex-maps';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const targetTypes = ['Aircraft', 'Helicopter', 'Cruise missile', 'Drone'];
const mapData = {
	center: [55.751574, 37.573856],
	zoom: 5,
};

function getBezierBasis(i, n, t) {
	function f(n) {
		return (n <= 1) ? 1 : n * f(n - 1);
	}

	return (f(n)/(f(i)*f(n - i)))* Math.pow(t, i)*Math.pow(1 - t, n - i);
}

function getBezierCurve(arr, step) {
	if (step == undefined) {
		step = 0.01;
	}

	if(arr.length < 2) {
		return [];
	}

	var res = new Array()

	for (var t = 0; t < 1 + step; t += step) {
		if (t > 1) {
			t = 1;
		}

		var ind = res.length;

		res[ind] = new Array(0, 0);

		for (var i = 0; i < arr.length; i++) {
			var b = getBezierBasis(i, arr.length - 1, t);

			res[ind][0] += arr[i][0] * b;
			res[ind][1] += arr[i][1] * b;
		}
	}

	return res;
}

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
				const count = targets.filter(target => target.indexOf(item.name) !== -1).length + 1;
				return [...targets, `${item.name} ${count}`];
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

const RLSMap = ({placemarks, setPlacmarks, setTargets, start, setPointerIndex, pointerIndex, simulationSpeed, pointer, setPointer}) => {
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

	return <Droppable allowedDropEffect={'copy'} map={mapRef} setPlacmarks={setPlacmarks} setTargets={setTargets}>
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
}

const App = () => {
	const [placemarks, setPlacmarks] = useState([]);
	const [targets, setTargets] = useState([]);
	const [start, setStart] = useState(false);
	const [pointerIndex, setPointerIndex] = useState(0);
	const [simulationSpeed, setSimulationSpeed] = useState(1);
	const [pointer, setPointer] = useState([]);

	const resetPlacmarks = () => {
		setPlacmarks([]);
		setTargets([]);
		setPointer([]);
	}
	const onStart = () => setStart(true);
	const onPause = () => setStart(false);
	const onReload = () => {
		setStart(false);
		setPointerIndex(0);
		setPointer([]);
	}
	const onSelect = (e) => setSimulationSpeed(e.target.value + 1);

	return (<DndProvider backend={HTML5Backend}>
			<div className='controls-wrapper'>
				<button onClick={resetPlacmarks}>Reset placemarks</button>
				<button onClick={onStart}>Start simulation</button>
				<button onClick={onPause}>Pause simulation</button>
				<button onClick={onReload}>Reload simulation</button>
				<select name='speed' onChange={onSelect}>
					{new Array(10)
						.fill(0)
						.map((item, index) => <option key={`option__${index + 1}`} value={index + 1}>{index + 1}x</option>)}
				</select>
			</div>
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
						<RLSMap placemarks={placemarks}
								setPlacmarks={setPlacmarks}
								setTargets={setTargets}
								start={start}
								setPointerIndex={setPointerIndex}
								pointerIndex={pointerIndex}
								simulationSpeed={simulationSpeed}
								pointer={pointer}
								setPointer={setPointer}/>
					</YMaps>
				</div>
			</div>
		</DndProvider>
	)
}

export default App;
