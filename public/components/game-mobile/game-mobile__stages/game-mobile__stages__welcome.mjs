
const gameMobileStageWelcome = async () => {
  await updateMessages(`Bienvenido, agente, a los headquarters del Gabinete de Pesquisas Tácticas, también conocida como la G.P.T. ¿Estás listo para tu misión? Antes que nada necesitaré tus datos personales. ¿Cuál es tu nombre?`);
  refInputEnabled.value = true;
}

export { gameMobileStageWelcome };
