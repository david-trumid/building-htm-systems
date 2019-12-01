import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

const offColor = '#FFF'
const ppColor = '#FDF542'
const inputColor = '#AAA'
const selectedColor = 'red'

const diagramPadding = 40


class PotentialPools extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// setup any time params change
	componentDidUpdate(prevProps) {
		this.update()
	}
	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramWidth / 2)
	}

	// handle setting up when params are set/changed
	update() {
		if (this.props.potentialPools) {
			this.renderMinicolumns()
			this.renderInputSpace()
		}
	}

	renderInputSpace() {
		const g = this.root.select('.input-space')
		// Split screen, this goes to the right
		g.attr('transform', `translate(${this.props.diagramWidth / 2},0)`)
		this.renderInput()
		this.renderPotentialPools()
		this.renderOverlay()
	}

	renderInput() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.input')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', d => {
					return d === 1 ? inputColor : offColor
				})
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 1)
				.attr('x', (_, i) => {
					return (i % cols) * cellWidth
				})
				.attr('y', (_, i) => {
					return (Math.floor(i / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		// Update
		const rects = g.selectAll('rect').data(this.props.encoding)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderMinicolumns() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.minicolumns')
		const cols = Math.floor(Math.sqrt(this.props.potentialPools.length))
		const cellWidth = diagramWidth / cols / 2
		const selectedMinicolumn = this.props.selectedMinicolumn

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d, i) => i === selectedMinicolumn ? selectedColor : offColor)
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 0.5)
				.attr('x', (d, i) => {
					return (i % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(i / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
				.attr('data-index', (d, i) => i)
		}

		// Update
		const rects = g.selectAll('rect').data(this.props.potentialPools)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderPotentialPools() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.potential-pool')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', ppColor)
				.attr('stroke', 'none')
				.attr('fill-opacity', 0.5)
				.attr('x', (d, i) => {
					return (d % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(d / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		// Update
		const rects = g.selectAll('rect').data(
			this.props.potentialPools[this.props.selectedMinicolumn]
		)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderOverlay() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.overlay')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2
		const potentialPool = this.props.potentialPools[this.props.selectedMinicolumn]

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('x', (_, i) => {
					return (i % cols) * cellWidth + 2
				})
				.attr('y', (_, i) => {
					return (Math.floor(i / cols)) * cellWidth + cellWidth - 2
				})
				.attr('font-size', cellWidth * .95)
				.attr('font-weight', 'bolder')
				.attr('fill', (d, i) => {
					if (d == 1) return potentialPool.includes(i) ? 'green' : 'white'
					return 'none'
				})
				.text((d, i) => {
					if (d !== offColor) return potentialPool.includes(i) ? '✓' : '✘'
					return ''
				})
		}

		// Update
		const rects = g.selectAll('text').data(this.props.encoding)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('text')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	// Triggers inconsistently!!
	selectMinicolumn(e) {
		const selectedMinicolumn = Number(e.target.getAttribute('data-index'))
		this.props.onUpdate(selectedMinicolumn)
	}

	render() {

		return (
			<svg id={this.props.id}
				ref={this.svgRef}>

				<g className="minicolumns" onClick={e => this.selectMinicolumn(e)}></g>

				<g className="input-space">
					<g className="input"></g>
					<g className="potential-pool"></g>
					<g className="overlay"></g>
				</g>

			</svg>
		)
	}
}

PotentialPools.propTypes = {
	id: PropTypes.string.isRequired,
	diagramWidth: PropTypes.number,
	data: PropTypes.object,
}

export default PotentialPools
