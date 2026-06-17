/**
 * app/nls/es/callcenter.js — Spanish (es) translation bundle.
 *
 * LEGACY: Dojo i18n locale bundle.
 * TODO: Replace with Angular ngx-translate JSON file (es.json) or Angular i18n XLIFF.
 */
define({
    // Application
    title: "CallCenter Pro",
    loading: "Cargando\u2026",

    // Agent panel
    agentPanel_title:      "Mi Estado",
    agentPanel_callsToday: "Llamadas Hoy",
    agentPanel_avgHandle:  "Tiempo Promedio",

    // Call queue
    queue_title:        "Cola de Llamadas",
    queue_empty:        "Sin llamadas en cola",
    queue_colCaller:    "Llamante",
    queue_colPhone:     "Tel\u00e9fono",
    queue_colSkill:     "Habilidad",
    queue_colAction:    "Acci\u00f3n",
    queue_btnAnswer:    "Contestar",
    queue_btnRefresh:   "Actualizar",

    // Active call
    activeCall_title:        "Llamada Activa",
    activeCall_idle:         "Sin llamada activa. Conteste una llamada de la cola para comenzar.",
    activeCall_caller:       "Llamante",
    activeCall_callId:       "ID de Llamada",
    activeCall_status:       "Estado",
    activeCall_customerInfo: "Info del Cliente",
    activeCall_lookingUp:    "Buscando cliente\u2026",
    activeCall_noCustomer:   "No se encontr\u00f3 registro de cliente",
    activeCall_btnHold:      "Poner en Espera",
    activeCall_btnTransfer:  "Transferir",
    activeCall_btnEnd:       "Terminar Llamada",
    activeCall_disposition:  "Disposici\u00f3n",
    activeCall_notes:        "Notas",
    activeCall_notesHint:    "Ingrese notas de la llamada\u2026",

    // Customer search
    search_title:       "B\u00fasqueda de Clientes",
    search_placeholder: "Nombre, tel\u00e9fono o n\u00famero de cuenta",
    search_noResults:   "No se encontraron clientes.",

    // Call history
    history_title:   "Historial de Llamadas",
    history_empty:   "Seleccione un cliente para ver el historial.",
    history_noRecs:  "Sin historial de llamadas para este cliente.",
    history_colDate:  "Fecha/Hora",
    history_colDur:   "Duraci\u00f3n",
    history_colAgent: "Agente",
    history_colDisp:  "Disposici\u00f3n",
    history_colNotes: "Notas",
    history_prevPage: "\u00ab Anterior",
    history_nextPage: "Siguiente \u00bb",

    // Transfer dialog
    transfer_title:       "Transferir Llamada",
    transfer_selectAgent: "Transferir Al Agente",
    transfer_notes:       "Notas de Transferencia",
    transfer_notesHint:   "Motivo / notas para el agente receptor\u2026",
    transfer_noAgents:    "Sin agentes disponibles",
    transfer_btnCancel:   "Cancelar",
    transfer_btnConfirm:  "Transferir Llamada",

    // Dispositions
    disp_resolved:      "Resuelto",
    disp_escalated:     "Escalado",
    disp_callback:      "Devoluci\u00f3n de Llamada",
    disp_voicemail:     "Mensaje de Voz",
    disp_wrong_number:  "N\u00famero Equivocado",
    disp_abandoned:     "Abandonado",

    // Agent statuses
    status_available:   "Disponible",
    status_busy:        "Ocupado",
    status_break:       "En Descanso",
    status_training:    "En Capacitaci\u00f3n",
    status_unavailable: "No Disponible",

    // Errors / notifications
    error_loginFailed:   "Error de inicio de sesi\u00f3n. Verifique sus credenciales.",
    error_callEnd:       "No se pudo terminar la llamada. Intente de nuevo.",
    error_critical:      "Ocurri\u00f3 un error cr\u00edtico: ",
    notify_welcome:      "\u00a1Bienvenido!",
    notify_onHold:       "Llamada en espera.",
    notify_transferred:  "Llamada transferida exitosamente.",
    notify_noDisposition: "Seleccione una disposici\u00f3n antes de terminar la llamada.",

    // Login form
    login_title:       "CallCenter Pro",
    login_username:    "Usuario",
    login_password:    "Contrase\u00f1a",
    login_btnLogin:    "Ingresar",
    login_errorInvalid: "Credenciales inv\u00e1lidas."
});
