import React from 'react';
import { useDrop } from 'react-dnd';
import { globalToMap } from '../utils';

export const Droppable = ({ allowedDropEffect, children, map, setTargets, setSelectedTarget, setTargetsPoints }) => {
	const [_, drop] = useDrop(() => ({
		accept: 'draggable',
		drop: (item, monitor) => {
			setTargets(targets => {
				const count = targets.filter(target => target.indexOf(item.name) !== -1).length + 1;

				const mapObject = map.current
				const projection = mapObject.options.get('projection');
				const position = monitor.getClientOffset();
				const newPlacemark = globalToMap(projection, position, mapObject);
				setTargetsPoints(points => {
					const copy = {...points};
					copy[`${item.name} ${count}`] = [newPlacemark];
					return copy;
				});
				setSelectedTarget(`${item.name} ${count}`);

				return [...targets, `${item.name} ${count}`];
			});
		},
	}), [allowedDropEffect]);
	return (<div ref={drop}>
		{children}
	</div>);
};
