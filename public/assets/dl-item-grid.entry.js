import { r as registerInstance, h } from './index-Dtt5iJ3u.js';
import { o as onChange, a as fetchItemsBySlotType, f as fetchItems, s as state } from './client-CPIywbzY.js';

const dlItemGridCss = () => `:host{display:block;font-family:var(--dl-font-family);color:var(--dl-text-primary);line-height:1.4}*{box-sizing:border-box;margin:0;padding:0}.grid{display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:8px}.empty{color:var(--dl-text-muted);font-size:13px;padding:20px;text-align:center}.loading{color:var(--dl-text-muted);font-size:13px;padding:20px;text-align:center}`;

const DlItemGrid = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /** When `true`, only shows items available in the shop. */
        this.shopableOnly = true;
        this._items = [];
        this._loading = false;
    }
    connectedCallback() {
        this.loadItems();
        this._unsubLanguage = onChange('language', () => {
            this.loadItems();
        });
    }
    disconnectedCallback() {
        var _a;
        (_a = this._unsubLanguage) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    propsChanged() {
        this.loadItems();
    }
    async loadItems() {
        this._loading = true;
        const language = state.language;
        try {
            let items;
            if (this.slotType) {
                items = await fetchItemsBySlotType(this.slotType, language);
            }
            else {
                items = await fetchItems(language);
            }
            items = items.filter(i => i.type === 'upgrade');
            if (this.shopableOnly)
                items = items.filter(i => i.shopable);
            if (this.tier)
                items = items.filter(i => i.item_tier === this.tier);
            items.sort((a, b) => { var _a, _b; return ((_a = a.item_tier) !== null && _a !== void 0 ? _a : 0) - ((_b = b.item_tier) !== null && _b !== void 0 ? _b : 0) || a.name.localeCompare(b.name); });
            this._items = items;
        }
        catch (_a) {
            this._items = [];
        }
        finally {
            this._loading = false;
        }
    }
    render() {
        if (this._loading) {
            return h("div", { class: "loading" }, "Loading items...");
        }
        if (!this._items.length) {
            return h("div", { class: "empty" }, "No items found");
        }
        return (h("div", { class: "grid" }, this._items.map(item => (h("dl-item-card", { itemData: item })))));
    }
    static get watchers() { return {
        "slotType": [{
                "propsChanged": 0
            }],
        "tier": [{
                "propsChanged": 0
            }]
    }; }
};
DlItemGrid.style = dlItemGridCss();

export { DlItemGrid as dl_item_grid };
