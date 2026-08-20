import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import { SettingsCard } from "./SettingsCard.js";
import { en, zh } from "./locales.js";
import { ensureStyles } from "./styles.js";
export const name = 'dsh-restart-client';
export const inject = ['slots', 'locale', 'settingsScope'];
export const NS = 'restart.card';
export function apply(ctx) {
    ensureStyles();
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-restart: dictionaries');
    const scope = ctx.settingsScope.bind({ namespace: 'dsh-restart' });
    const project = () => {
        const snap = scope.getSnapshot();
        const value = (snap.value ?? {});
        return {
            available: snap.status === 'ready',
            writable: snap.writable,
            legacyRestart: value.legacyRestart === true,
            continuePrompt: typeof value.continuePrompt === 'string' ? value.continuePrompt : '',
            watchdogEnabled: value.watchdogEnabled === true,
            watchdogCooldownMs: typeof value.watchdogCooldownMs === 'number' ? value.watchdogCooldownMs : 0,
            watchdogPollMs: typeof value.watchdogPollMs === 'number' ? value.watchdogPollMs : 0,
        };
    };
    const store = createSnapshotStore(project());
    scope.subscribe(() => { store.set(project()); });
    // `key` binds this card to the `dsh-restart` settings namespace the Host
    // reports via settingsScope.describe(). Older @deepseek-ai/dsh-client-ui-slots
    // (<=0.1.0-rc.6) types omit `key`, so the options object is cast to keep the
    // build green across peer versions; the runtime honours `key` regardless.
    const itemOptions = {
        name: 'settings.plugin.item',
        key: 'dsh-restart',
        id: 'dsh-restart',
        order: 40,
        locale: NS,
        inject: () => ({
            hooks: { dshRestart: store },
            set: (field, value) => { void scope.set(field, value); },
            clear: (field) => { void scope.unset(field); },
        }),
    };
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(itemOptions, SettingsCard));
}
