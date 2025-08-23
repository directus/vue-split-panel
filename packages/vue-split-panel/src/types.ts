export interface SplitPanelProps {
	/**
	 * Sets the split panel's orientation
	 * @default 'horizontal'
	 */
	orientation?: 'horizontal' | 'vertical';

	/**
	 * Sets the split panel's text direction
	 * @default 'ltr'
	 */
	direction?: 'ltr' | 'rtl';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the panels component is resized */
	primary?: 'start' | 'end';

	/**
	 * The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. CSS value
	 * @default '12px'
	 */
	dividerHitArea?: string;

	/**
	 * Whether the size v-model should be in relative percentages or absolute pixels
	 * @default '%'
	 */
	sizeUnit?: '%' | 'px';

	/**
	 * Disable the manual resizing of the panels
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * The minimum allowed size of the primary panel
	 * @default 0
	 */
	minSize?: number;

	/** The maximum allowed size of the primary panel */
	maxSize?: number;

	/**
	 * Whether to allow the primary panel to be collapsed on enter key on divider or when the collapse threshold is met
	 * @default false
	 */
	collapsible?: boolean;

	/** How far to drag beyond the minSize to collapse/expand the primary panel */
	collapseThreshold?: number;

	/**
	 * How long should the collapse/expand state transition for in CSS value
	 * @default '0'
	 */
	transitionDuration?: string;

	/**
	 * CSS transition timing function for the expand transition
	 * @default 'cubic-bezier(0, 0, 0.2, 1)'
	 */
	transitionTimingFunctionExpand?: string;

	/**
	 * CSS transition timing function for the collapse transition
	 * @default 'cubic-bezier(0.4, 0, 0.6, 1)'
	 */
	transitionTimingFunctionCollapse?: string;

	/**
	 * What size values the divider should snap to
	 * @default []
	 */
	snapPoints?: number[];

	/**
	 * How close to the snap point the size should be before the snapping occurs
	 * @default 12
	 */
	snapThreshold?: number;
}
