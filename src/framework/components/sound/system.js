pc.extend(pc, function () {
    /**
     * @name pc.SoundComponentSystem
     * @class Manages creation of {@link pc.SoundComponent}s.
     * @description Create a SoundComponentSystem
     * @param {pc.Application} app The Application
     * @param {pc.SoundManager} manager The sound manager
     * @property {Number} volume Sets / gets the volume for the entire Sound system. All sounds will have their volume
     * multiplied by this value. Valid between [0, 1].
     * @property {AudioContext} context Gets the AudioContext currently used by the sound manager. Requires Web Audio API support.
     * @property {pc.SoundManager} manager Gets / sets the sound manager
     * @extends pc.ComponentSystem
     */
    var SoundComponentSystem = function (app, manager) {
        this.id = "sound";
        this.description = "Allows an Entity to play sounds";
        app.systems.add(this.id, this);

        this.ComponentType = pc.SoundComponent;
        this.DataType = pc.SoundComponentData;

        this.schema = [
            'enabled',
            'volume',
            'pitch',
            'positional',
            'refDistance',
            'maxDistance',
            'rollOffFactor',
            'distanceModel',
            'slots'
        ];

        this.manager = manager;

        pc.ComponentSystem.on('update', this.onUpdate, this);

        this.on('beforeremove', this.onBeforeRemove, this);
    };
    SoundComponentSystem = pc.inherits(SoundComponentSystem, pc.ComponentSystem);

    pc.extend(SoundComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {
            properties = ['volume', 'pitch', 'positional', 'refDistance', 'maxDistance', 'rollOffFactor', 'distanceModel', 'slots', 'enabled'];
            SoundComponentSystem._super.initializeComponentData.call(this, component, data, properties);
        },

        onUpdate: function(dt) {
            var store = this.store;

            for (var id in store) {
                if (store.hasOwnProperty(id)) {
                    var item = store[id];
                    var entity = item.entity;
                    var componentData = item.data;

                    // Update slot position if this is a 3d sound
                    if (componentData.enabled && entity.enabled && componentData.positional) {
                        var position = entity.getPosition();
                        var slots = componentData.slots;
                        for (var key in slots) {
                            slots[key].updatePosition(position);
                        }
                    }
                }
            }
        },

        onBeforeRemove: function (entity, component) {
            var slots = component.slots;
            // stop non overlapping sounds
            for (var key in slots) {
                if (! slots[key].overlap) {
                    slots[key].stop();
                }
            }
        }
    });

    Object.defineProperty(SoundComponentSystem.prototype, 'volume', {
        get: function () {
            return this.manager.volume;
        },
        set: function (volume) {
            this.manager.volume = volume;
        }
    });

    Object.defineProperty(SoundComponentSystem.prototype, 'context', {
        get: function () {
            if (! pc.SoundManager.hasAudioContext()) {
                console.warn('WARNING: Audio context is not supported on this browser');
                return null;
            }

            return this.manager.context;
        }
    });

    return {
        SoundComponentSystem: SoundComponentSystem
    };
}());
