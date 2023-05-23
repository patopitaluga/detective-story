const stages = await fetch('../../enum_stages.json').then((_) => _.json());

import { store } from '../../store.mjs'

const gameMobileComponent = {
  template: `<div class="game-mobile">
  <header class="game-mobile__header">
    <div class="game-mobile__avatar">
    </div>
  </header>

  <div
    ref="chatHistory"
    class="game-mobile__history"
  >

    <p
      v-for="eachMessage in refMessageList"
      class="game-mobile__message"
    >
      <span v-if="eachMessage.loading">
        …
      </span>
      <span v-else>
        {{ eachMessage.text }}
      </span>
    </p>

    <button
      v-for="eachOption in refOptions"
      :class="{
        'game-mobile__option': true,
        'game-mobile__option--disabled': eachOption.disabled,
      }"
      @click="eachOption.action"
    >
      {{ eachOption.text }}
    </button>
  </div>
  <form
    v-if="refInputEnabled"
    @submit.prevent="mtdSendMessage"
    class="game-mobile__user-input"
  >
    <div class="game-mobile__user-input__input-cont">
      <input
        type="text"
        placeholder="Mensaje"
        v-model="refInputValue"
      />
    </div>
    <button>
    </button>
  </form>
</div>`,
  setup: function() {
    const chatHistory = Vue.ref(null);

    const refMessageList = Vue.ref([]);
    const refOptions = Vue.ref([]);
    const refInputEnabled = Vue.ref(false);
    const refInputValue = Vue.ref('');

    /**
     * Adds the new message to the chat history. It takes some seconds just for effect.
     * @param {Promise<null>} - in case it's required as a callback.
     * @returns {Promise<null>} - in case it's required as a callback.
     */
    const updateMessages = (text, delay) => {
      if (typeof delay === 'undefined') delay = 1500;

      return new Promise((resolve, reject) => {
        refMessageList.value = [
          ...refMessageList.value,
          {
            loading: true,
            text: text,
          },
        ];
        store.playSound('typing');
        setTimeout(() => {
          const lastMessage = refMessageList.value[refMessageList.value.length - 1];
          refMessageList.value.pop();
          lastMessage.loading = false;
          Vue.nextTick(() => {
            refMessageList.value = [
              ...refMessageList.value,
              lastMessage,
            ];
            resolve();
          })
        }, delay);
        if (chatHistory.value) {
          setTimeout(() => {
            chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
          }, 25);
        }
      })
    };

    /**
     * Triggered when the user writes
     */
    const mtdSendMessage = () => {
      if (refInputValue.value.length === 0) return;
      store.setAgentName(refInputValue.value);
      refInputValue.value = '';
      refInputEnabled.value = false;
    };

    /**
     * This will be triggered any time the gameStage change in the store, and also when started.
     * @param {string} _ -
     */
    const startStageChat = async (_) => {
      switch (_) {
        case stages.WELCOME:
          await updateMessages(`Bienvenido, agente, a los headquarters del Gabinete de Pesquisas Tácticas, también conocida como la G.P.T. ¿Estás listo para tu misión? Antes que nada necesitaré tus datos personales. ¿Cuál es tu nombre?`);
          refInputEnabled.value = true;
          break;
        case stages.CHARACTER_CREATION:
          await updateMessages(`Agente ${store.agentName}, para completar su ficha psicotécnica debe responder unas preguntas ¿Cómo describiría su destreza física? Puntos restantes: ${store.skillPoints}`);
          refOptions.value = [
            { text: 'Soy un atleta (8)',
              action: () => {
                if (store.skillPoints < 8) return;
                refOptions.value = [];
                store.setDexterity(8);
              },
              disabled: store.skillPoints < 8,
            },
            { text: 'Soy bastante diestro (6)',
              action: () => {
                if (store.skillPoints < 6) return;
                refOptions.value = [];
                store.setDexterity(6);
              },
              disabled: store.skillPoints < 6,
            },
            { text: 'Soy algo torpe (4)',
              action: () => {
                if (store.skillPoints < 4) return;
                refOptions.value = [];
                store.setDexterity(4);
              },
              disabled: store.skillPoints < 4,
            },
          ];
          break;
        case stages.CHARACTER_CREATION2:
          await updateMessages(`¿Qué tan bueno es observando? Puntos restantes: ${store.skillPoints}`);
          refOptions.value = [
            { text: 'Nada se me escapa (8)',
              action: () => {
                if (store.skillPoints < 8) return;
                refOptions.value = [];
                store.setObservation(8);
              },
              disabled: store.skillPoints < 8,
            },
            { text: 'Me fijo en algunos detalles (6)',
              action: () => {
                if (store.skillPoints < 6) return;
                refOptions.value = [];
                store.setObservation(6);
              },
              disabled: store.skillPoints < 6,
            },
            { text: 'Soy distraído (4)',
              action: () => {
                if (store.skillPoints < 4) return;
                refOptions.value = [];
                store.setObservation(4);
              },
              disabled: store.skillPoints < 4,
            },
          ];
          break;
        case stages.CHARACTER_CREATION3:
          await updateMessages(`¿Eres persuasivo? Puntos restantes: ${store.skillPoints}`);
          refOptions.value = [
            { text: 'Hago llorar los maleantes (8)',
              action: () => {
                if (store.skillPoints < 8) return;
                refOptions.value = [];
                store.setPersuasion(8);
              },
              disabled: store.skillPoints < 8,
            },
            { text: 'Puedo convencer a algunos (6)',
              action: () => {
                if (store.skillPoints < 6) return;
                refOptions.value = [];
                store.setPersuasion(6);
              },
              disabled: store.skillPoints < 6,
            },
            { text: 'Me ignora hasta mi perro (4)',
              action: () => {
                if (store.skillPoints < 4) return;
                refOptions.value = [];
                store.setPersuasion(4);
              },
              disabled: store.skillPoints < 4,
            },
          ];
          break;
        case stages.CHARACTER_CREATION4:
          await updateMessages(`¿Cómo es su puntería? Puntos restantes: ${store.skillPoints}`);
          refOptions.value = [
            { text: 'Puedo acertar a una mosca (8)',
              action: () => {
                if (store.skillPoints < 8) return;
                refOptions.value = [];
                store.setAiming(8);
              },
              disabled: store.skillPoints < 8,
            },
            { text: 'Soy buen tirador (6)',
              action: () => {
                if (store.skillPoints < 6) return;
                refOptions.value = [];
                store.setAiming(6);
              },
              disabled: store.skillPoints < 6,
            },
            { text: 'Solo a veces acierto (4)',
              action: () => {
                if (store.skillPoints < 4) return;
                refOptions.value = [];
                store.setAiming(4);
              },
              disabled: store.skillPoints < 4,
            },
          ];
          break;
        case stages.MISSION_BRIEFING:
          refMessageList.value = [];
          await updateMessages('Estos son los detalles de su misión:');
          await updateMessages(`Han robado ${store.lootName} en ${store.initialCountry.cityEs}, ${store.initialCountry.es}. Sospechamos que se trata de un atraco del famoso ladrón de guante blanco ${store.thiefName}. Tienes 48hs para encontrarlo antes de que pueda vender su botín en el mercado negro.`)
          refOptions.value = [
            { text: `Viajar a ${store.initialCountry.es}`,
              action: () => {
                refOptions.value = [];
                refMessageList.value = [];
                updateMessages('✈️', 0);
                store.goToCountry(store.initialCountry);
              },
            },
          ];
          break;
        case stages.GAME_LOOP_INITIAL_COUNTRY:
          await new Promise((p) => setTimeout(p, 2000));
          await updateMessages(`Horas restantes: ${store.missionHours}`);
          await updateMessages(`Has llegado a ${store.currentCountry.cityEs}. ¿Cuál será el siguiente paso de tu investigación?`);
          refOptions.value = [
            { text: 'Interrogar a un testigo',
              action: () => { store.setGameStage(stages.GAME_LOOP_WITNESS) },
            },
            { text: 'Recolectar evidencias',
              action: () => { store.setGameStage(stages.GAME_LOOP_CSI) },
            },
            { text: 'Viajar',
              action: () => { store.setGameStage(stages.GAME_LOOP_CHOOSE_DESTINATION) },
            },
          ];
          break;
        case stages.GAME_LOOP_WITNESS:
          store.subtractMissionHours(3);
          refOptions.value = [];
          refMessageList.value = [];
          await updateMessages('Dificultad: 10. Arrojando 🎲 D10');
          await new Promise((p) => setTimeout(p, 2000));
          await updateMessages(`Resultado: Tu habilidad persuasiva ${store.agentPersuasion} + 7 = ${(store.agentPersuasion + 7)} > 10. ¡Éxito!`);
          await updateMessages('Has interrogado al testigo. ¿Cuál será el siguiente paso de tu investigación?');
          await updateMessages(`Horas restantes: ${store.missionHours}`);
          refOptions.value = [
            { text: 'Recolectar evidencias',
              action: () => { store.setGameStage(stages.GAME_LOOP_CSI) },
            },
            { text: 'Viajar',
              action: () => { store.setGameStage(stages.GAME_LOOP_CHOOSE_DESTINATION) },
            },
          ];
          break;
        case stages.GAME_LOOP_CSI:
          store.subtractMissionHours(3);
          refOptions.value = [];
          refMessageList.value = [];
          await updateMessages('Dificultad: 10. Arrojando 🎲 D10');
          await new Promise((p) => setTimeout(p, 2000));
          await updateMessages(`Resultado: Tu habilidad de observación ${store.agentObservation} + 7 = ${(store.agentObservation + 7)} > 10. ¡Éxito!`);
          await updateMessages('Has investigado la escena donde estuvo el sospechoso. ¿Cuál será el siguiente paso de tu investigación?');
          await updateMessages(`Horas restantes: ${store.missionHours}`);
          refOptions.value = [
            { text: 'Viajar',
              action: () => { store.setGameStage(stages.GAME_LOOP_CHOOSE_DESTINATION) },
            },
          ];
          break;
        case stages.GAME_LOOP_CHOOSE_DESTINATION:
          refOptions.value = [];
          await updateMessages('Los destinos disponibles son:');
          refOptions.value = [
            { text: store.countriesToTravel[store.rightTravels][0].es,
              action: () => {
                refOptions.value = [];
                refMessageList.value = [];
                updateMessages('✈️', 0);
                store.goToCountry(store.countriesToTravel[store.rightTravels][0]);
              },
            },
            { text: store.countriesToTravel[store.rightTravels][1].es,
              action: () => {
                refOptions.value = [];
                refMessageList.value = [];
                updateMessages('✈️', 0);
                store.goToCountry(store.countriesToTravel[store.rightTravels][1]);
              },
            },
            { text: store.countriesToTravel[store.rightTravels][2].es,
              action: () => {
                refOptions.value = [];
                refMessageList.value = [];
                updateMessages('✈️', 0);
                store.goToCountry(store.countriesToTravel[store.rightTravels][2]);
              },
            },
          ];
          break;
      }
    };
    Vue.watch(() => store.gameStage, (newStage) => {
      startStageChat(newStage);
    });
    startStageChat(store.gameStage);

    return {
      chatHistory,
      refMessageList,
      refOptions,
      refInputEnabled,
      refInputValue,
      mtdSendMessage,
    };
  },
};

export { gameMobileComponent };
