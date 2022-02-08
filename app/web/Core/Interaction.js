class Interaction {
    /**
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Callbacks
        this.clickListeners = [];
        var that = this;
        input.subscribe(InputTypes.ON_MOVE, (event, cartesian, modifier) => {
            return that._onMove(event.endPosition, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
            return that._onClick(event.position, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_UP, (event, cartesian, modifier) => {
            return that._onUp(event.position, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_DOWN, (event, cartesian, modifier) => {
            return that._onDown(event.position, cartesian, modifier);
        });

        // Data
        this.interactables = [];
        this.hoveredInteractable = null;
        this.draggingInteractable = null;
        this.pickingRadius = 25;
    }

    addInteractable(interactable) {
        this.interactables.push(interactable);
    }

    removeInteractable(interactable) {
        var index = this.interactables.indexOf(interactable);
        if (index > -1)
            this.interactables.splice(index, 1);
    }

    subscribeEmptyClick(listener) {
        this.clickListeners.push(listener);
    }

    unsubscribeEmptyClick(listener) {
        this.clickListeners = this.clickListeners.filter(item => item !== listener)
    }

    _firstMatchPickingInteractable(position) {
        var objects = this.viewer.scene.drillPick(position, undefined, this.pickingRadius, this.pickingRadius);
        if (!objects.length)
            return null;

        for (const interactable of this.interactables) {
            if (interactable.matchInteraction(objects))
                return interactable;
        }
        return null;
    }

    _onMove(position, cartesian, modifier) {
        // If dragging, just do it
        if (this.draggingInteractable)
            return this.draggingInteractable.drag(position, cartesian, modifier);

        // Find something to hover
        var interactable = this._firstMatchPickingInteractable(position);
        if (this.hoveredInteractable === interactable)
            return false;

        // Drop old hover
        if (this.hoveredInteractable)
            this.hoveredInteractable.setHovered(false);

        // Hover newone
        if (interactable && interactable.enabled)  {
            interactable.setHovered(true);
            this.hoveredInteractable = interactable;
            return true;
        }

        // Or nothing
        this.hoveredInteractable = null;
        return false;
    }

    _onClick(position, cartesian, modifier) {
        var interactable = this._firstMatchPickingInteractable(position);

        // TODO: select here

        // Promoute object's self click
        if (interactable && interactable.enabled &&
            (interactable.hovered || interactable.dragging)) {
            return interactable.selfClick(modifier);
        }

        // Promoute empty click, if no object under click
        for (const listener of this.clickListeners) {
            if (listener(cartesian))
            return true;
        }
        return false;
    }

    _onUp(position, cartesian, modifier) {
        if (this.draggingInteractable) {
            this._setDragging(null);
            return true;
        }
        return false;
    }

    _onDown(position, cartesian, modifier) {
        var interactable = this._firstMatchPickingInteractable(position);
        if (interactable && interactable.draggable && interactable.enabled) {
            this._setDragging(interactable);
            return true;
        }
        return false;
    }

    _setDragging(interactable) {
        if (this.draggingInteractable)
            this.draggingInteractable.setDragging(false);

        this.draggingInteractable = interactable;

        if (interactable)
            interactable.setDragging(true);

        var scene = this.viewer.scene;
        scene.screenSpaceCameraController.enableRotate = interactable === null;
        scene.screenSpaceCameraController.enableTranslate = interactable === null;
        scene.screenSpaceCameraController.enableZoom = interactable === null;
    }
}
