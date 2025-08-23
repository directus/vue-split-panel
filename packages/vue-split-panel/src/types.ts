export interface SplitPanelProps {
	/** Sets the split panel's orientation */
	orientation?: 'horizontal' | 'vertical';

	/** Sets the split panel's text direction */
	direction?: 'ltr' | 'rtl';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the panels component is resized */
	primary?: 'start' | 'end';

	/** The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. CSS value */
	dividerHitArea?: string;

	/** Whether the size v-model should be in relative percentages or absolute pixels */
	sizeUnit?: '%' | 'px';

	/** Disable the manual resizing of the panels */
	disabled?: boolean;

	/** The minimum allowed size of the primary panel */
	minSize?: number;

	/** The maximum allowed size of the primary panel */
	maxSize?: number;

	/** Whether to allow the primary panel to be collapsed on enter key on divider or when the collapse threshold is met */
	collapsible?: boolean;

	/** How far to drag beyond the minSize to collapse/expand the primary panel */
	collapseThreshold?: number;

	/** How long should the collapse/expand state transition for in CSS value */
	transitionDuration?: string;

	/** CSS transition timing function for the expand transition */
	transitionTimingFunctionExpand?: string;

	/** CSS transition timing function for the collapse transition */
	transitionTimingFunctionCollapse?: string;

	/** What size values the divider should snap to */
	snapPoints?: number[];

	/** How close to the snap point the size should be before the snapping occurs */
	snapThreshold?: number;
}
