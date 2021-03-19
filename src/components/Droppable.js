import React from 'react';
import { useDrop } from 'react-dnd';

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
