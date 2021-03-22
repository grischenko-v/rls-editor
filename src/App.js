import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Draggable } from './components/Draggble';
import { RLSMap } from './components/Map';
import Slider from 'react-input-slider';
import './App.css';

const targetTypes = ['Aircraft', 'Helicopter', 'Cruise missile', 'Drone'];

const App = () => {
	const [targets, setTargets] = useState([]);
	const [start, setStart] = useState(false);
	const [pointerIndex, setPointerIndex] = useState(0);
	const [simulationSpeed, setSimulationSpeed] = useState(1);
	const [pointer, setPointer] = useState([]);
	const [selectedTarget, setSelectedTarget] = useState('');
	const [targetsPoints, setTargetsPoints] = useState({});

	React.useEffect(() => {
		if(targetsPoints[selectedTarget]) {
			setPointer(targetsPoints[selectedTarget][0]);
		}
	}, [selectedTarget, targetsPoints]);

	const onStart = () => setStart(true);
	const onPause = () => setStart(false);
	const onReload = () => {
		setStart(false);
		setPointerIndex(0);
	}
	const onSelect = (e) => setSimulationSpeed(e.target.value + 1);

	const onSliderChange = (e) => {
		setStart(false);
		setPointerIndex(e.x);
	}

	const onTargetSelect = (item) => {
		setSelectedTarget(item);
		setPointerIndex(0);
		setPointer(targetsPoints[selectedTarget][0]);
		setStart(false);
	}

	return (<DndProvider backend={HTML5Backend}>
			<div className='controls-wrapper'>
				<button onClick={onStart}>Start simulation</button>
				<button onClick={onPause}>Pause simulation</button>
				<button onClick={onReload}>Reload simulation</button>
				<Slider axis="x" x={pointerIndex} onChange={onSliderChange} xmin={0} xmax={100}/>
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
						{targets.map(item => <li
							key={item}
							className={`list-item ${selectedTarget === item ? 'list-item--selected' : ''}`}
							onClick={() => onTargetSelect(item)}>
							{item}
						</li>)}
					</ul>
				</div>
				<div >
						<RLSMap
								setTargets={setTargets}
								start={start}
								setPointerIndex={setPointerIndex}
								pointerIndex={pointerIndex}
								simulationSpeed={simulationSpeed}
								pointer={pointer}
								selectedTarget={selectedTarget}
								setSelectedTarget={setSelectedTarget}
								targetsPoint={targetsPoints}
								setTargetsPoints={setTargetsPoints}/>

				</div>
			</div>
		</DndProvider>
	)
}

export default App;
