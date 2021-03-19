import React from "react";
import {useDrag} from "react-dnd";

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