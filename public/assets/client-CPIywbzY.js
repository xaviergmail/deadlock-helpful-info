import { S as StencilCore } from './index-Dtt5iJ3u.js';

var Language;
(function (Language) {
    Language["PT_BR"] = "brazilian";
    Language["CS"] = "czech";
    Language["EN"] = "english";
    Language["FR"] = "french";
    Language["DE"] = "german";
    Language["ID"] = "indonesian";
    Language["IT"] = "italian";
    Language["JA"] = "japanese";
    Language["KO"] = "koreana";
    Language["ES_LA"] = "latam";
    Language["PL"] = "polish";
    Language["RU"] = "russian";
    Language["ZH_CN"] = "schinese";
    Language["ES"] = "spanish";
    Language["TH"] = "thai";
    Language["TR"] = "turkish";
    Language["UK"] = "ukrainian";
})(Language || (Language = {}));
const SUPPORTED_LANGUAGES = Object.values(Language);

const appendToMap = (map, propName, value) => {
    let refs = map.get(propName);
    if (!refs) {
        refs = [];
        map.set(propName, refs);
    }
    if (!refs.some((ref) => ref.deref() === value)) {
        refs.push(new WeakRef(value));
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        const refs = map.get(key).filter((ref) => {
            const elm = ref.deref();
            return elm && isConnected(elm);
        });
        map.set(key, refs);
    }
}, 2_000);
const core = StencilCore;
const forceUpdate = core.forceUpdate;
const getRenderingRef = core.getRenderingRef;
const stencilSubscription = () => {
    if (typeof getRenderingRef !== 'function' || typeof forceUpdate !== 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        return {};
    }
    const ensureForceUpdate = forceUpdate;
    const ensureGetRenderingRef = getRenderingRef;
    const elmsToUpdate = new Map();
    return {
        dispose: () => elmsToUpdate.clear(),
        get: (propName) => {
            const elm = ensureGetRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        },
        set: (propName) => {
            const refs = elmsToUpdate.get(propName);
            if (refs) {
                const nextRefs = refs.filter((ref) => {
                    const elm = ref.deref();
                    if (!elm)
                        return false;
                    return ensureForceUpdate(elm);
                });
                elmsToUpdate.set(propName, nextRefs);
            }
            cleanupElements(elmsToUpdate);
        },
        reset: () => {
            elmsToUpdate.forEach((refs) => {
                refs.forEach((ref) => {
                    const elm = ref.deref();
                    if (elm)
                        ensureForceUpdate(elm);
                });
            });
            cleanupElements(elmsToUpdate);
        },
    };
};

const unwrap = (val) => (typeof val === 'function' ? val() : val);
const createObservableMap = (defaultState, shouldUpdate = (a, b) => a !== b) => {
    const resolveDefaultState = () => (unwrap(defaultState) ?? {});
    const initialState = resolveDefaultState();
    let states = new Map(Object.entries(initialState));
    const proxyAvailable = typeof Proxy !== 'undefined';
    const plainState = proxyAvailable ? null : {};
    const handlers = {
        dispose: [],
        get: [],
        set: [],
        reset: [],
    };
    // Track onChange listeners to enable removeListener functionality
    const changeListeners = new Map();
    const reset = () => {
        // When resetting the state, the default state may be a function - unwrap it to invoke it.
        // otherwise, the state won't be properly reset
        states = new Map(Object.entries(resolveDefaultState()));
        if (!proxyAvailable) {
            syncPlainStateKeys();
        }
        handlers.reset.forEach((cb) => cb());
    };
    const dispose = () => {
        // Call first dispose as resetting the state would
        // cause less updates ;)
        handlers.dispose.forEach((cb) => cb());
        reset();
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (shouldUpdate(value, oldValue, propName)) {
            states.set(propName, value);
            if (!proxyAvailable) {
                ensurePlainProperty(propName);
            }
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (proxyAvailable
        ? new Proxy(initialState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        })
        : (() => {
            syncPlainStateKeys();
            return plainState;
        })());
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const setHandler = (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        };
        const resetHandler = () => {
            const snapshot = resolveDefaultState();
            cb(snapshot[propName]);
        };
        // Register the handlers
        const unSet = on('set', setHandler);
        const unReset = on('reset', resetHandler);
        // Track the relationship between the user callback and internal handlers
        changeListeners.set(cb, { setHandler, resetHandler, propName });
        return () => {
            unSet();
            unReset();
            changeListeners.delete(cb);
        };
    };
    const use = (...subscriptions) => {
        const unsubs = subscriptions.reduce((unsubs, subscription) => {
            if (subscription.set) {
                unsubs.push(on('set', subscription.set));
            }
            if (subscription.get) {
                unsubs.push(on('get', subscription.get));
            }
            if (subscription.reset) {
                unsubs.push(on('reset', subscription.reset));
            }
            if (subscription.dispose) {
                unsubs.push(on('dispose', subscription.dispose));
            }
            return unsubs;
        }, []);
        return () => unsubs.forEach((unsub) => unsub());
    };
    const forceUpdate = (key) => {
        const oldValue = states.get(key);
        handlers.set.forEach((cb) => cb(key, oldValue, oldValue));
    };
    const removeListener = (propName, listener) => {
        const listenerInfo = changeListeners.get(listener);
        if (listenerInfo && listenerInfo.propName === propName) {
            // Remove the specific handlers that were created for this listener
            removeFromArray(handlers.set, listenerInfo.setHandler);
            removeFromArray(handlers.reset, listenerInfo.resetHandler);
            changeListeners.delete(listener);
        }
    };
    function ensurePlainProperty(key) {
        if (proxyAvailable || !plainState) {
            return;
        }
        if (Object.prototype.hasOwnProperty.call(plainState, key)) {
            return;
        }
        Object.defineProperty(plainState, key, {
            configurable: true,
            enumerable: true,
            get() {
                return get(key);
            },
            set(value) {
                set(key, value);
            },
        });
    }
    function syncPlainStateKeys() {
        if (proxyAvailable || !plainState) {
            return;
        }
        const knownKeys = new Set(states.keys());
        for (const key of Object.keys(plainState)) {
            if (!knownKeys.has(key)) {
                delete plainState[key];
            }
        }
        for (const key of knownKeys) {
            ensurePlainProperty(key);
        }
    }
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        dispose,
        reset,
        forceUpdate,
        removeListener,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState, shouldUpdate) => {
    const map = createObservableMap(defaultState, shouldUpdate);
    map.use(stencilSubscription());
    return map;
};

const { state, onChange } = createStore({
    language: Language.EN,
    tooltipTrigger: 'hover',
    tooltipPlacement: 'auto',
    tooltipFollowCursor: false,
    tooltipDelay: 100,
    showTierBadge: true,
    showScalingValues: false,
});

const API_BASE = 'https://api.deadlock-api.com/v1/assets';
const cache = new Map();
let genericDataCache = null;
function fetchGenericData() {
    if (genericDataCache)
        return genericDataCache;
    genericDataCache = fetch(`${API_BASE}/generic-data`)
        .then(res => {
        if (!res.ok)
            throw new Error(`Failed to load generic data: ${res.status}`);
        return res.json();
    })
        .catch(err => {
        genericDataCache = null;
        throw err;
    });
    return genericDataCache;
}
function loadItems(language) {
    const cached = cache.get(language);
    if (cached)
        return cached;
    const promise = fetch(`${API_BASE}/items?language=${language}`)
        .then(res => {
        if (!res.ok)
            throw new Error(`Failed to load items: ${res.status} ${res.statusText}`);
        return res.json();
    })
        .catch(err => {
        cache.delete(language);
        throw err;
    });
    cache.set(language, promise);
    return promise;
}
async function fetchItems(language = Language.EN) {
    return loadItems(language);
}
async function fetchItemsBySlotType(slotType, language = Language.EN) {
    const items = await loadItems(language);
    return items.filter(i => i.item_slot_type === slotType);
}
async function fetchItem(idOrClassName, language = Language.EN) {
    const items = await loadItems(language);
    const item = items.find(i => typeof idOrClassName === 'number'
        ? i.id === idOrClassName
        : i.class_name === idOrClassName);
    if (!item)
        throw new Error(`Item not found: ${idOrClassName}`);
    return item;
}

export { Language as L, SUPPORTED_LANGUAGES as S, fetchItemsBySlotType as a, fetchItem as b, fetchGenericData as c, fetchItems as f, onChange as o, state as s };
