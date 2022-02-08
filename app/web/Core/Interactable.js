class Interactable {
    /**
       @param {Interaction} interaction
     */
    constructor(interaction) {
        // Data
        this.enabled = true;
        this.selectable = true;
        this.selected = false;
        this.draggable = true;
        this.dragging = false;
        this.hovered = false;
        this.interaction = interaction;

        this.interaction.addInteractable(this);
    }

    clear() {
        this.interaction.removeInteractable(this);
    }

    setEnabled(enabled) { this.enabled = enabled; }
    setSelected(selected) { this.selected = selected; }
    setDragging(dragging) { this.dragging = dragging; }
    setHovered(hovered) { this.hovered = hovered; }
    matchInteraction(objects) { return false; }
    drag(position, cartesian, modifier) { return false; }
    selfClick(modifier) { return false; }
}
