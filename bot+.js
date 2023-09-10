//Creating a bot
const mineflayer = require("mineflayer");
const autoeat = require('mineflayer-auto-eat').plugin
const toolPlugin = require('mineflayer-tool').plugin
//Creating bot settings
const bot = mineflayer.createBot({
//Host
    host: "localhost",
//Port
    port: "",
//Minecraft version
    version: "",
//Username
    username: "" });

// Load your dependency plugins.
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

// Import required behaviors.
const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine } = require("mineflayer-statemachine");

// Wait for our bot to login.
bot.once("spawn", () =>
{
    // This targets object is used to pass data between different states. It can be left empty.
    const targets = {};

    // Create our states
    const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);

    // Create our transitions
    const transitions = [

        // We want to start following the player immediately after finding them.
        // Since getClosestPlayer finishes instantly, shouldTransition() should always return true.
        new StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => true,
        }),

        // If the distance to the player is less than two blocks, switch from the followPlayer
        // state to the lookAtPlayer state.
        new StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        // If the distance to the player is more than two blocks, switch from the lookAtPlayer
        // state to the followPlayer state.
        new StateTransition({
            parent: lookAtPlayer,
            child: followPlayer,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2,
        }),
    ];

    // Now we just wrap our transition list in a nested state machine layer. We want the bot
    // To start on the getClosestPlayer state, so we'll specify that here.
    const rootLayer = new NestedStateMachine(transitions, getClosestPlayer);

    // We can start our state machine simply by creating a new instance.
    new BotStateMachine(bot, rootLayer);
});
//Plugin
bot.loadPlugin(autoeat)

bot.on('autoeat_started', (item, offhand) => {
    console.log(`Eathing ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})
bot.on('autoeat_finished', (item, offhand) => {
    console.log(`Finished eathing ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', console.error)
//Plugin
bot.loadPlugin(toolPlugin)

bot.on('spawn', async () => {
    const blockPos = bot.entity.position.offset(0, -1, 0)
    const block = bot.blockAt(blockPos)

    await bot.tool.equipForBlock(block, {})
    await bot.dig(block)
})
