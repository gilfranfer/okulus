/* Messages send from the backend. Usually used in Alert divs */
const systemMsgs = {
	error:{
		nologin: "Necesitas iniciar sesión para ver este contenido.",
		noPrivileges: "No cuentas con los permisos necesarios para ver este contenido.",
		noPrivilegesShort: "No cuentas con los permisos necesarios.",
		rootAlreadySet:"El Super Usuario ya existe.",
		/* AuthenticationCntrl*/
		memberlinkedDoesntExist: "El Miembro asociado al Usuario ya no existe.",
		memberAndUserEmailMismatch: "El Correo del Miembro no coincide con el del Usuario.",
		memberNotActiveUser: "El Miembro asociado/encontrado no está activo.",
		referenceRemoved: "Se ha borrado la referencia entre el Usuario y el Miembro.",
		contactAdmin: "Contacta al Administrador del Sistema.",
		noMemberFound: "No se encontró un Miembro con el correo electrónico:",
		moreThanOneMemberFound: "Existe mas de un Miembro con el correo electrónico:",
		pwdResetEmailError: "Ha sucedido un Error. Revisa el correo proporcionado o comunícate con el Administrador.",
		/*LoginCntrl*/
		incorrectCredentials: "Usuario o Contraseña Incorrectos",
		/* RegistrationCntrl */
		emailExist: "El correo electrónico ya está en uso.",
		tryAgainLater: "Hubo un error. Intente más tarde.",
		noMemberAssociated:"No cuentas con un Miembro asociado a tu cuenta. Contacta al administrador.",
		recordDoesntExist: "La información solicitada no está disponible. Puede que haya sido borrada.",
		/*Members*/
		noMembersError:"No se encontraron Miembros",
		loadingMembersError:"Error al cargar la lista de Miembros",
		deletingActiveMember:"No se puede eliminar un Miembro Activo",
		/*Groups*/
		noGroupsError:"No se encontraron Grupos",
		loadingGroupsError:"Error al cargar la lista de Grupos",
		deletingActiveGroup:"No se puede eliminar un Grupo Activo",
		groupHasReports:"No se puede eliminar el Grupo porque tiene Reportes asociados.",
		duplicatedRule:"La regla ya existe.",
		creatingRuleError:"Error al crear la regla de acceso",
		deletingRuleError:"Error al eliminar la regla de acceso",
		inactiveGroup:"El Grupo especificado está Inactivo",
		inexistingGroup:"El Grupo especificado no Existe",
		/* Users */
		inexistingUser:"El Usuario especificado no Existe",
		/* Requests */
		inexistingRequest:"La Solicitud especificada no Existe",
		/*Weeks*/
		weekExists:"Ya existe la Semana",
		deleteWeekError:"No se puede eliminar la semana porque tiene 1 o más reportes.",
		/*Reports*/
		noReportsError:"No se encontraron Reportes",
		loadingReportsError:"Error al cargar la lista de Reportes",
		duplicatedAttendance:"ya está en la lista de asistencia.",
		savingApprovedReport:"No se puede modificar el reporte porque ya ha sido aprobado",
		cantRemoveApprovedReport:"No se puede eliminar el reporte porque ya ha sido aprobado",
		/*Message Center*/
		postingMessageError: "Error al crear el mensaje. Intentelo nuevamente.",
		loadingMessagesError: "Error al cargar los mensajes. Intentelo nuevamente.",
		deleteMessageSuccess: "Error al eliminar el mensaje. Intentelo nuevamente.",
		reportsWatch:"Uno o mas reportes, relacionados con su búsqueda, han sido modificados.",
		groupTypeNotAdded:"Error al agregar el Tipo de Grupo",
		groupTypeNotRemoved:"Error al eliminar el Tipo de Grupo",
		groupTypeExist:"El tipo de Grupo ya existe.",
		/* Member Requests */
		approvedRequestUpdate: "No se puede modificar una Solicitud aprobada.",
		approvedRequestReject: "No se puede rechazar una Solicitud aprobada.",
		approvedRequestCancel: "No se puede cancelar una Solicitud aprobada.",
		noMemberRequestsFound: "No se encontraron solicitudes de miembros"
	},
	inProgress:{
		sendingPwdResetEmail:"Enviando Correo...",
		logingUser: "Iniciando sesión...",
		registeringUser: "Registrando Usuario...",
		loading:"Cargando ...",
		working:"Estamos trabajando en tu solicitud ...",
		/*Members JS*/
		loadingMember:"Cargando información del Miembro ...",
		loadingAllMembers:"Cargando Todos los Miembros ...",
		loadingActiveMembers:"Cargando Miembros Activos ...",
		loadingInactiveMembers:"Cargando Miembros Inactivos ...",
		loadingLeadMembers:"Cargando Miembros Líderes ...",
		loadingHostMembers:"Cargando Miembros Anfitriones ...",
		loadingTraineeMembers:"Cargando Miembros Aprendices ...",
		savingMemberInfo:"Guardando Información del Miembro",
		savingMemberAddress:"Guardando Dirección del Miembro",
		deletingMember:"Eliminando Miembro ...",
		deletingMemberAddress:"Eliminando Dirección del Miembro ...",
		/*Groups JS*/
		loadingGroup:"Cargando información del Grupo ...",
		loadingAccessRules:"Cargando reglas de acceso ...",
		loadingAllGroups:"Cargando Todos los Grupos ...",
		loadingActiveGroups:"Cargando Grupos Activos ...",
		loadingInactiveGroups:"Cargando Grupos Inactivos ...",
		savingGroupInfo:"Guardando Información del Grupo",
		deletingGroup:"Eliminando Grupo ...",
		deletingGroupAddress:"Eliminando Dirección del Grupo ...",
		creatingRule:"Creando Regla de Acceso ...",
		deletingRule:"Eliminando Regla de Acceso ...",
		/*Weeks JS*/
		loadingWeek:"Cargando información de la Semana ...",
		loadingAllWeeks:"Cargando Todas los Semanas ...",
		loadingOpenWeeks:"Cargando Semanas Abiertas ...",
		loadingClosedWeeks:"Cargando Semanas Cerradas ...",
		loadingVisibleWeeks:"Cargando Semanas Visibles ...",
		loadingHiddenWeeks:"Cargando Semanas Ocultas ...",
		savingWeekInfo:"Guardando Información de la Semana",
		deletingWeek:"Eliminando Semana",
		/* Reports JS */
		loadingAllReports:"Cargando Todos los Reportes ...",
		loadingApprovedReports:"Cargando Reportes Aprobados ...",
		loadingRejectedReports:"Cargando Reportes Rechazados ...",
		loadingPendingReports:"Cargando Reportes Pendientes de Revisar ...",
		loadingAllReports:"Cargando Todos los Reportes...",
		loadingReport:"Cargando Reporte ...",
		savingReport:"Guardando Reporte ...",
		preparingReport:"Preparando Reporte ...",
		validatingReport:"Validando Reporte ...",
		approvingReport:"Aprobando Reporte ...",
		rejectingReport:"Rechazando Reporte ...",
		removingReport:"Eliminando Reporte ...",
		/* Admin Summary and statistics */
		loadingSummary:"Cargando Resumen",
		loadingReportFinder:"Cargando Buscador de Reportes",
		searchingReports:"Buscando Reportes",
		/*Message Center*/
		postingMessage: "Publicando mensaje ...",
		deletingMessage: "Eliminando mensaje ...",
		savingConfig:"Guardando Configuraciones ...",
		/*Member Request*/
		creatingRequest:"Creando Solicitud ...",
		approvingRequest:"Aprobando Solicitud ...",
		rejectingRequest:"Rechazando Solicitud ...",
		updatingRequest:"Actualizando Solicitud ...",
		cancellingRequest:"Cancelando Solicitud ..."
	},
	success:{
		pwdResetEmailSent: "Hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.!",
		userRegistered: "Usuario Creado",
		noMoreChatMessages:"No hay más mensajes",
		/* Members JS */
		allMembersTitle:"Miembros existentes",
		activeMembersTitle:"Miembros Activos",
		inactiveMembersTitle:"Miembros Inactivos",
		leadMembersTitle:"Miembros Líderes",
		traineeMembersTitle:"Miembros Aprendices",
		hostMembersTitle:"Miembros Anfitriones",
		memberInfoSAved:"Información Guardada",
		memberAddressRemoved:"Dirección Eliminada",
		memberCreated:"Miembro Creado",
		memberRemoved:"Miembro Eliminado",
		membershipStatusUpdated:"Estado de la membresia actualizado",
		memberRoleUpdated:"Rol del Miembro modificado",
		baseGroupUpdated:"Grupo Base Actualizado",
		/* Groups JS */
		allGroupsTitle:"Grupos existentes",
		activeGroupsTitle:"Grupos Activos",
		inactiveGroupsTitle:"Grupos Inactivos",
		groupInfoSaved:"Información Guardada",
		groupAddressRemoved:"Dirección Eliminada",
		groupCreated:"Grupo Creado",
		groupRemoved:"Grupo Eliminado",
		groupStatusUpdated:"Estado del grupo actualizado",
		groupHostUpdated:"Anfitrión Actualizado",
		groupLeadUpdated:"Lider Actualizado",
		groupTraineeUpdated:"Aprendíz Actualizado",
		ruleCreated:"Regla Creada",
		ruleRemoved:"Regla Eliminada",
		/* Weeks JS */
		statusUpdated:"Estado de la Semana actualizado.",
		visibilityUpdated:"Visibilidad de la Semana actualizada.",
		weekInfoUpdated:"Semana Actualizada",
		weekDeleted:"Se ha eliminado la semana",
		/* Reports JS */
		attendanceAdded:"agregado a la lista.",
		attendanceRemoved:"fue removido de la lista.",
		reportUpdated:"Reporte Actualizado",
		reportCreated:"Reporte Creado",
		reportDeleted:"Reporte Eliminado",
		reportApproved:"Reporte Aprobado",
		reportRejected:"Reporte Rechazado",
		reportsRetrieved:"Reportes Encontrados",
		allReportsTitle:"Reportes Existentes",
		approvedReportsTitle:"Reportes Aprobados",
		rejectedReportsTitle:"Reportes Rechazados",
		pendingReportsTitle:"Reportes Pendientes de Revisión",
		/*Message Center*/
		postingMessageSuccess:"El mensaje ha sido publicado.",
		deleteMessageSuccess: "El mensaje ha sido eliminado.",
		configSaved:"Configuraciones Guardadas.",
		groupTypeAdded:"Nuevo Tipo de Grupo agregado",
		groupTypeRemoved:"Se ha eliminado el Tipo de Grupo",
		/*Member Request*/
		requestsLoaded:"Solictudes Cargadas",
		requestCreated:"La solicitud ha sido Creada",
		memberCreatedFromRequest:"La solicitud ha sido Aprobada. Nuevo Miembro creado.",
		requestRejected:"La solicitud ha sido Rechazada",
		requestUpdated:"La solicitud ha sido Actualizada",
		requestCanceled:"La solicitud ha sido Cancelada"
	},
	/* Notification Descriptions */
	notificaions:{
		memberRequested:"Se ha solicitado la creación de un Miembro",
		memberRequestedUpdated:"Solicitud de Miembro modificada",
		memberRequestApproved:"Su solicitud de Miembro ha sido aprobada",
		memberRequestRejected:"Su solicitud de Miembro ha sido rechazada",
		memberRequestCanceled:"Se ha cancelado una solicitud de Miembro"
	}
};

/* Map with valid actions and their description. Used for notification Service*/
const actionsDescMap = new Map([
				[constants.actions.create, "creado"], [constants.actions.update, "actualizado"],
				[constants.actions.delete, "eliminado"],
				[constants.actions.approve,"aprobado"], [constants.actions.reject,"rechazado"],
				[constants.actions.open,"abierto"], [constants.actions.close,"cerrado"],
				[constants.actions.show,"visible"], [constants.actions.hide,"oculto"],
				[constants.actions.grantAccess,"Acceso Concedido a"],
				[constants.actions.revokeAccess,"Acceso Removido a"],
				[constants.actions.updateRole,"Tipo de Usuario Modificado"],
			]);

/*Actions performed on the following elements can trigger notificaions
 Key: is used to validate an element can trigger a notificaciones
 Value: will be used to build the Notification description*/
const notifiableElements = new Map([
		[constants.db.folders.groups,"Grupo"],
		[constants.db.folders.members,"Miembro"],
		[constants.db.folders.reports,"Reporte"],
		[constants.db.folders.weeks,"Semana"],
		[constants.db.folders.users,"Usuario"],
		[constants.db.folders.memberRequest,"solicitud"]
	 ]);

/** Using a run function to set the language in the rootScope **/
okulusApp.run(function($rootScope) {
		$rootScope.i18n = {
			navigation:{
				register:"Registrarse", login:"Iniciar Sesión", logout:"Cerrar Sesión",
				home:"Inicio", chat:"Conversaciones", notifications:"Notificaciones",
				groups:"Mis Grupos", contacts:"Mis Contactos", statistics:"Estadísticas",
				reports:"Mis Reportes",
				requests:"Mis Solicitudes",backToHome: "Regresar a la Página de Inicio",
				admin:{
					menu: "Administrador", summary:"Resumen", statistics:"Estadísticas",
					groups: "Grupos", members: "Miembros", weeks: "Semanas",
					reports: "Reportes", monitor:"Monitor", config:"Configuración",
					reunions:"Reuniones", requests:"Solicitudes"
				}
			},
			profile:{
				lastLogin: "Última sesión:",
				lastActivity: "Última actividad:",
				viewProfileBtn: "Ver Perfil"
			},
			launchpad:{
				title:"Acciones rápidas", createReport:"Crear Reporte",
				createMember:"Crear Miembro", requestMember:"Solicitar Miembro",
				viewMyReports:"Ver Mis Reportes", viewMyRequests:"Ver Mis Solicitudes"
			},
			msgCenter:{
				title: "Mensajes del Administrador",
				instruction: "Usa el cuadro de texto para redactar un mensaje a los usuarios:",
				importanMsg: "Mensaje Importante", deleteMsg: "X Eliminar Mensaje",
				noMessages: "No hay mensajes.", sendBtn: "Enviar"
			},
			notifications:{
				title:"Centro de Notificaciones", by:"Por:", noRecords:"No tienes ninguna notificación",
				unreaded:"Notificación sin Leer", deleteAll: "Eliminar Todo", cleanAll:"Marcar Todo Leido",
				loading:"Cargando Notificaciones...", loadingSuccess: "Notificaciones Cargadas.",
				loadingError: "Error al cargar las notificaciones. Intentelo más tarde.",
				deleteBtn:"Eliminar Notificación", readBtn:"Marcar leida",
				unreadBtn:"Marcar No leida",
				loadedNotifications: "Notificaciones fueron cargadas.",
				loadPending1: "Clic aquí para mostrar ",
				loadPending2: "Notificaciones restantes."
			},
			login:{
				title:"Inicia Sesión",
				invalidEmail:"Ese no es un correo válido",
				password: "Contraseña", passwordHint: "Tus palabras secretas",
				pwdRequired:"La contraseña es requerida", forgotPwd: "Olvidé mi contraseña",
				resetPwd: "Restablecer contraseña", resetPwdBtn:"Restablecer contraseña",
				loginBtn:"Iniciar Sesión"
			},
			register:{
				title:"Regístrate", titleRoot:"Registro de Super Usuario",
				registerBtn:"Registrarse", emailDisclosure:"",
				password: "Contraseña", passwordHint: "Tus palabras secretas",
				pwdSize:"Al menos 8 caracteres", confirmPassword: "Confirma la contraseña",
				alert:{ invalidEmail:"Ese no es un correo válido",
							pwdSize:"La contraseña debe contener al menos 8 caracteres",
							pwdMatch:"Las contraseñas deben coincidir"
				}
			},
			emailValidation:{
				errorMessage: "Tu correo electrónico no ha sido verificado:",
				reviewEmail:"Hemos mandado un mensaje de verificación a tu correo electrónico.",
				verify: "Mandar correo de verificación."
			},
			chat:{
				emptyChat:"No hay mensajes en esta conversación",
				startConversation:"Abrir Conversación", noChats:"No tienes Conversaciones",
				usersList:"Lista de Usuarios", userChatsList:"Mis Conversaciones",
				newchatBtn:"Iniciar Conversación",newChatLbl:"Conversación Nueva!",
				deletedForAll:"(Eliminado para todos)",deletedForUser:"(Eliminado para tí)",
				editedMessage:"(Editado)",
				modals:{
					newChatTitle:"Nueva Conversación",
					noUsersFound:"No se encontraron otros Usuarios",
					deleteMessageTitle:"Eliminar Mensaje",
					deleteForMeBtn:"Eliminar para mí",
					deleteForAllBtn:"Eliminar para todos",
					editMessageTitle:"Editar Mensaje"
				}
			},
			reports:{
				reportLbl:"Reporte", reportsLbl:"Reportes",
				myReportsLbl:"Mis Reportes",
				/* Admin Reports */
				adminTitle:"Administrador de Reportes",
				modifyLbl:"Modificar", newLbl: "Nuevo", reportLbl:"Reporte",
				reunionLbl:"Reporte de Reunión", basicInfoTitle:"Grupo y Roles",
				detailsInfoTitle:"Detalles de la Reunión",
				/* Buttons */
				editBtn:"Editar Reporte",
				newBtn:"Nuevo Reporte",
				goToBtn:"Ver Reportes",
				deleteBtn:"Eliminar Reporte",
				/**/
				studyTitle:"Información del estudio",
				allReportsLbl:"Todos los Reportes", pendingReviewLbl:"Por Revisar",
				totalReports:"Reportes Existentes", approvedReports:"Reportes Aprobados",
				rejectedReports:"Reportes Rechazados", pendingReports:"Reportes Pendientes",
				loadingSuccess:"Reportes Cargados", loadPending1: "Mostar ", loadPending2: "Reportes restantes.",
				/*Form Labels*/
				groupLbl:"Grupo", leadLbl: "Líder",	traineeLbl: "Aprendíz", hostLbl: "Anfitrión",
				dateLbl: "Fecha de reunión", dateHint: "12/22/2017",
				durationLbl: "Duración (min)", weekLbl:"Semana", moneyLbl: "Ofrenda",
				statusLbl:"Estado de la Reunión",
				studyNotesLbl:"Notas del estudio", studyNotesHint:"Agregar notas sobre el estudio",
				commentsLbl:"Notas",
				newReport: "Nuevo Reporte", reunionLegend:"Reunión del Grupo",
				basicDataLegend: "Detalles de la Reunión",
				title:"Datos generales de la Reunión",
				cancelStatusLbl:"Reunión Cancelada", okStatusLbl:"Reunión Realizada",
				canceledLbl: "Canceladas", completedLbl:"Completadas",
				pendingLbl: "Pendientes", approvedLbl:"Aprobados", rejectedLbl:"Rechazados",
				pendingStatusLbl: "Pendiente", approvedStatusLbl:"Aprobado", rejectedStatusLbl:"Rechazado",
				notesLegend: "Notas de la Reunión", notesHint: "Agregar notas y comentarios sobre la reunión",
				attendanceLegend: "Asistencia",
				membersAttendanceLbl:"Asistencia de Miembros",
				guestsAttendanceLbl:"Asistencia de Invitados",
				totalAttendanceLbl:"Asistencia  Total",
				membersAttendanceDirections:"Selecciona un miembro de la lista, o agrega a todos",
				guestsAttendanceDirections:"Escribe el nombre del invitado, o agrega multiples",
				multipleGuestsDirections:"Multiples invitados? Escribe un nombre genérico.",
				multipleGuestsQty:"Cantidad. Max",
				clicHere:"clic aquí",
				membersLbl: "Miembros", guestsLbl: "Invitados",
				allMembersLbl:"Ver de otros grupos", groupMembersLbl:"Ver de este Grupo",
				maleLbl: "Hombres", femaleLbl: "Mujeres",
				maleAbrev: "H", femaleAbrev: "M",
				adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
				studyLbl: "Titulo", seriesLbl: "Serie",
				noMembersList:"No se ha registrado la asistencia de Miembros",
				noGuestsList:"No se ha registrado la asistencia de Invitados",
				approvedReport: "Reporte Aprobado", rejectedReport:"Reporte Rechazado", pendingReport:"Reporte en Revisión",
				reportEvalLegend:"Evaluación del Reporte",feedbackLbl:"Discusión"
			},
			weeks:{
				weekLbl:"Semana", weeksLbl:"Semanas",
				title: "Administrador de Semanas",
				basicInfoTitle:"Información Básica",
				description: "Las Semanas son los contenedores de los Reportes.",
        closeInstructions:
          "Se recomienda cerrar cada semana cuando se hayan recibido todos los reportes, para que ya no aparezacn al momento de crear un reporte. "+
          "Tambíen es posbile ocultar las semanas del buscador de reportes.",
        /* Counter Section */
        totalWeeks:"Semanas Existentes", openWeeks: "Semanas Abiertas", closedWeeks:"Semanas Cerradas",
        visibleWeeks: "Semanas Visibles", hiddenWeeks:"Semanas Ocultas",
        /* Badges */
        openLbl:"Abierta", closedLbl:"Cerrada",
        showLbl:"Visible", hideLbl:"Oculta",
        /*Buttons*/
        loadBtn:"Todas las Semanas",
				newBtn:"Nueva Semana",
				goToBtn:"Ver Semanas",
        openBtn:"Abrir", closeBtn:"Cerrar",
        openWeekBtn:"Abrir Semana", closeWeekBtn:"Cerrar Semana",
        showBtn:"Mostrar", hideBtn:"Ocultar",
				showWeekBtn:"Mostrar Semana", hideWeekBtn:"Ocultar Semana",
				editBtn:"Editar Semana",
				saveWeekBtn:"Guardar Semana",
				deleteWeekBtn:"Eliminar Semana",
        /*Alert Messages*/
        loading:"Cargando Semanas...", loadingSuccess: "Semanas Cargadas.",
        loadingError: "Error al cargar las Semanas. Intentelo más tarde.",
        noWeeksError: "No se encontraron Semanas.",
				deleteError:"No se puede eliminar la semana porque tiene 1 o más reportes.",
				weekUpdated:"Se ha actualizado la Semana",
				weekCreated:"Se ha creado la Semana",
				weekDeleted:"Se ha eliminado la semana",
				weekExists:"Ya existe la Semana",
				loadPending1: "Mostar ", loadPending2: "Semanas restantes.",
        /*Labels*/
        weekLbl: "Semana", nameLbl:"Nombre", nameHint:"Enero 01 al 07",
        yearLbl:"Año", weekDateLbl:"Semana del año", weekDateHint:"",
				notesLbl: "Notas o comentarios", notesHint:"Vacaciones de Año Nuevo.",
				statusLbl:"Se pueden agregar reportes? (Estado)",
				openStatusLbl:"Sí. Semana Abierta", closedStatusLbl:"No. Semana Cerrada",
				visibilityLbl:"Se muestra en el buscador de Reportes? (Visibilidad)",
				showStatusLbl:"Sí. Semana Visible", hideStatusLbl:"No. Semana Oculta",
				modifyLbl:"Modificar", newLbl: "Nueva", statusTitle:"Estado"
			},
			members:{
				memberLbl:"Miembro", membersLbl:"Miembros",
				/* Admin Members */
				adminTitle:"Administrador de  Miembros",
				/* Global Badges */
				totalMembers:"Miembros Existentes",
				activeMembers:"Miembros Activos", inactiveMembers:"Miembros Inactivos",
				leadLbl:"Líder", hostLbl:"Anfitrión", traineeLbl:"Aprendíz",
				leadsLbl:"Líderes", hostsLbl:"Anfitriones", traineesLbl:"Aprendices",
				/*Buttons*/
				loadBtn:"Todos los Miembros",
				newBtn:"Nuevo Miembro",
				goToBtn:"Ver Miembros",
				saveBasicInfoBtn:"Guardar información básica",
				saveAddressBtn:"Guardar dirección",
				saveAllBtn:"Guardar cambios",
				addAddressBtn:"Agregar dirección",
				deleteAddressBtn:"Eliminar dirección",
				deleteMemberBtn:"Eliminar miembro",
				editBtn:"Editar Miembro",
				/*Alert Messages*/
        loadingSuccess: "Miembros Cargados.",
				loadPending1: "Mostar ", loadPending2: "Miembros restantes.",
				/*Labels*/
				memberLbl:"Miembro",
				basicInfoTitle:"Información Básica",
				membershipTitle:"Membresía",
				groupsTitle:"Grupos",
				modifyLbl:"Modificar información del", newLbl: "Nuevo",
				activeLbl:"Miembro Activo", inactiveLbl:"Miembro Inactivo",
				activeStatusLbl:"Miembro Activo", inactiveStatusLbl:"Miembro Inactivo",
				fnameLbl:"Nombre", fnameHint:"Francisco Fernando",
				lnameLbl:"Apellido", lnameHint:"Gil Villalobos",
				aliasLbl:"Alias", aliasHint:"Franfer Gil",
				sexLbl:"Sexo", maleLbl:"Hombre", femaleLbl:"Mujer",
				bdayLbl:"Fecha de nacimiento",
				statusLbl:"Estado de la membresía",
				isHostLbl:"Es Anfitrión?", isLeadLbl:"Es Líder?",
				isTraineeLbl:"Es Aprendíz?",
				baseGroupLbl: "Grupo Base", noGroup:"Sin Grupo",
				notesLbl: "Notas o comentarios",
				/*Member Request*/
				memberRequestLbl:"Solicitud de Creación de Miembro.",
				rejectedRequest:"Esta solicitud ha sido Rechazada.",
				approvedRequest:"Esta solicitud ha sido Aprobada.",
				pendingRequest:"Esta solicitud ha sido Realizada. Actualmente en revisión.",
				canceledRequest:"Esta solicitud ha sido Cancelada.",
				/*TODO: Used?*/
				filterDescription: "Usa el cuadro de texto para filtrar los resultados.",
				loading:"Cargando Miembros...", loadingSuccess: "Miembros Cargados.",
				loadingError: "Error al cargar los miembros. Intentelo más tarde.",
				noMembersError: "No se encontraron Miembros.",
				filterMemberType:"Tipo de Miembro", allMembersLabel:"Todos", hostLabel: "Anfitriones",
				leadLabel:"Líderes", traineeLabel: "Aprendíces"
			},
			requests:{
				requestLbl:"Solicitud", requestsLbl:"Solicitudes",
				myRequestsTitle:"Mis Solicitudes de Miembros", adminTitle:"Solicitudes de Creación de Miembros",
				pendingLbl:"Pendientes", approvedLbl:"Aprobadas", rejectedLbl:"Rechazadas",
				allRequestsLbl:"Todas las Solicitudes", loadedLbl:"Solicitudes Cargadas",
				pendingRequestsLbl:"Solicitudes en Revisión",	pendingRequestLbl:"Solicitud en Revisión", pendingShortLbl:"En Revisión",
				approvedRequestsLbl:"Solicitudes Aprobadas", approvedRequestLbl:"Solicitud Aprobada", approvedShortLbl:"Aprobadas",
				rejectedRequestsLbl:"Solicitudes Rechazadas",	rejectedRequestLbl:"Solicitud Rechazada", rejectedShortLbl:"Rechazadas",
				canceledRequestsLbl:"Solicitudes Canceladas",	canceledRequestLbl:"Solicitud Cancelada", canceledShortLbl:"Canceladas",
				newMemberRequest:"Nueva Solicitud", openRequestBnt:"Ver Solicitud", myRequests:"Mis Solicitudes",
				admin:{
					donotCreateRequests:"Como Aministrador, puedes crear miembros sin necesidad de una Solicitud",
					pendingLbl:"Solicitudes por Revisar", approvedLbl:"Solicitudes Aprobadas",
					rejectedLbl:"Solicitudes Recahzadas", canceledLbl:"Solicitudes Canceladas",
					pendingShortLbl:"Por Revisar"
				}
			},
			groups:{
				groupLbl:"Grupo", groupsLbl:"Grupos",
				/* Admin Groups */
				adminTitle:"Administrador de Grupos Familiares",
				/*Badges*/
				activeGroups:"Grupos Activos", activeLbl:"Activo",
				inactiveGroups:"Grupos Inactivos", inactiveLbl:"Inactivo",
				totalGroups:"Grupos Existentes",
				/*Buttons*/
				loadBtn:"Todos los Grupos",
				newBtn:"Nuevo Grupo", goToBtn:"Ver Grupos",
				editBtn:"Editar Grupo",
				deleteBtn:"Eliminar Grupo", saveBtn:"Guardar",
				/*Alert Messages*/
        loadingSuccess: "Grupos Cargados.",
				loadPending1: "Mostar ", loadPending2: "Grupos restantes.",
				/*Labels*/
				groupLbl:"Grupo",
				basicInfoTitle:"Información Básica",
				additionalInfoTitle:"Roles", contactTitle:"Datos de Contacto",
				modifyLbl:"Modificar Información del", newLbl: "Nuevo",
				statusLbl:"Estado del Grupo",
				activeStatusLbl:"Grupo Activo", inactiveStatusLbl:"Grupo Inactivo",
				typeLbl:"Tipo", scheduleLbl:"Horario", schdTimeHint: "20:00",
				numberLbl:"Número", numberHint:"0", typeLbl:"Tipo",
				nameLbl:"Nombre", nameHint:"Semillas de Esperanza",
				mandatoryFields: "Campos Obligatorios",
				noLeadLbl:"Sin Líder", noHostLbl:"Sin Anfitrión", noTraineeLbl:"Sin Aprendíz",
				/*Access Rules*/
				accessTitle:"Control de acccesos al Grupo",
				newAccessTitle:"Porporcionar Acceso",
				accessListTitle:"Usuarios con acccesos al Grupo",
				loadingRulesSuccess: "Reglas de Acceso Cargadas.",
				loadPendingRules1: "Mostar ", loadPendingRules2: "Reglas restantes.",
				ruleDate:"Desde",
				ruleDeleteBtn:"Eliminar Regla",
				accessDescription: "Proporcionar acceso a un Usuario le permite crear reportes para el grupo y ver la información histórica del mismo. La lista muestra solo los miembros con acceso al sistema.",
				noRulesMessage: "No hay reglas de acceso en este grupo",
				table:{
					memberName:"Miembro", memberId:"Id", date:"Desde"
				}
			},
			groupModal:{
				title:"Seleccionar Grupo"
			},
			address:{
				legend: "Dirección",
				streetLbl:"Calle", streetHint:"",
				extNumberLbl: "Num ext", extNumberHint: "",
				intNumberLbl: "Num int", intNumberHint: "",
				zipLbl: "C.P.", zipHint: "",
				cityLbl: "Ciudad", cityHint: "",
				neighborhoodLbl: "Colonia", neighborhoodHint: "",
				stateLbl: "Estado", stateHint: "",
				countryLbl: "Pais", countryHint: ""
			},
			contact:{
				emailLbl:"Correo electrónico", emailHint:"micorreo@gmail.com",
				phoneLbl:"Teléfono", phoneHint:""
			},
			audit:{
				title:"Detalles del Registro", creation:"Creación", update:"Última Actualización",
				approval:"Aprobación", rejection: "Rechazo"
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar", updateBtn:"Actualizar",
				requestBtn:"Iniciar Solicitud", approveRequestBtn:"Aprobar Solicitud",
				rejectRequestBtn:"Rechazar Solicitud", deleteRequestBtn:"Eliminar Solicitud",
				yesBtn: "Si!", noBtn: "No!",
				/** Access Rules **/
				returnBtn:"Regresar",
				addReport: "Crear Reporte", accessRules:"Reglas de Accesos",
				/*Reports*/
				addBtn: "+",here:"aquí", commentBtn:"Comentar",
				approveBtn:"Aprobar Reporte" , rejectBtn:"Rechazar Reporte"
			},
			alerts:{
				loading:"Cargando ...", working:"Estamos trabajando en tu solicitud ...",
				invalidForm:"Hay datos faltantes o incorrectos en el formulario. Revisa los campos marcados con *",
				confirmDelete: "Seguro que deseas eliminar este registro?",
				confirmQuestion: "Seguro?"
			},
			forms:{
				searchHint:"Buscar ...",
				filterHint:"Filtrar resultados..."
			},
			reportFinder:{
				title: "Buscador de Reportes",
				selectGroupLbl:"Seleccione los Grupos", selectWeekLbl:"Seleccione las Semanas",
				allGroupTypes:"Cualquier tipo",
				allGroups:"Cualquier estado", activeGroups:"Grupos Activos", inactiveGroups:"Grupos Inactivos",
				allWeeks:"Cualquier estado", openWeeks:"Semanas Abiertas", closedWeeks:"Semanas Cerradas",
				visibleWeeks:"Semanas Visibles", hiddenWeeks:"Semanas Ocultas",
				selectAllLbl:"Seleccionar todo",
				// weekFrom: "De la Semana", weekTo:"a la Semana", groupsList:"Grupo",
				// description:"Puedes seleccionar una o mas semanas, así como uno o más grupos, para ver los Reportes y los gráficos de análisis.",
				chartOrientation:"Orientación de las Gráficas", chartLandscape:"Horizontal", chartPortrait: "Vertical",
				selectAllGroups:"Seleccionar todos los grupos", findReportsBtn:"Buscar Reportes",
				weeksOrderError: "Verifica el orden de las Semanas seleccionadas",
				resultsLoaded: "Reportes encontrados",
				reportsListTitle: "Lista de Reportes",
				attendanceSummaryTitle: "Asistencia",
				attendanceChartsTitle: "Gráficas de Reuniones y Asistencia",
				moneyChartsTitle: "Gráfica de Ofrenda",	durationChartsTitle: "Gráfica de Duración",
				totalLbl: "Total",
				table:{
					reunionStatus:"Reunión", reportStatus:"Reporte",
					group:"Grupo", week:"Semana",	date:"Fecha",
					duration: "Duración", money: "Ofrenda",
					attendance: "Asistencia",
					canceledLbl:"Cancelada", completedLbl:"Completada"
				}
			},
			charts:{
				attendanceTitle:"Personas Ministradas",
				reunionsLbl:"Reuniones", completedLbl:"Completadas", canceledLbl:"Canceladas",
				attendanceLbl:"Asistencia",
				attendanceGuestsSerie:"Invitados",
				attendanceMemberstSerie:"Miembros",
				durationTitle:"Minutos Ministrados",
				durationLbl:"Duración",
				moneyTitle:"Ofrenda",	moneyAvgTitle:"Promedio"
			},
			summary:{
				title:"Resumen del Sistema", adminLbl:"Administrador"
			},
			statistics:{
				adminTitle:"Estadísticas de los Grupos",
				userTitle:"Estadísticas de mis Grupos"
			},
			admin:{
				weeksList:{noWeeksError: "No se han creado Semanas"},
				dashboard:{
					noReportsError: "No hay reportes disponibles para las opciones seleccionadas"
				},
				audit:{
					title: "Auditoria de la Información", select: "Seleccionar Área a Auditar:",
					groupsOptn:"Grupos", membersOptn:"Miembros", reportsOptn:"Reportes",
					weeksOptn:"Semanas", usersOptn:"Usuarios", messagesOptn:"Mensajes",
					loadAudit: "Mostrar Movimientos",
					loading: "Cargando Registros ...",
					loadingError: "Error al cargar los registros. Intentelo más tarde.",
					loadingSuccess: "Registros cargados.",
					noRecords: "No hay registros disponibles.",
					table:{
						action: "Accion", by:"Hecha por", on:"Hecha en", date:"Fecha"
					}
				},
				users:{
					title:"Usuarios Registrados", adminLbl: "Administrador", userLbl: "Usuario",
					loadUsers: "Mostrar Lista de Usuarios",
					loading: "Cargando Usuarios ...",
					loadingError: "Error al cargar los usuarios. Intentelo más tarde.",
					loadingSuccess: "Usuarios cargados.",
					noRecords: "No se encontraron Usuarios.",
					table:{
						user: "Usuario", type:"Tipo",created:"Desde", lastLogin:"Última Sesión",
						lastActivity:"Última Actividad", sessionStatus:"Estado"
					}
				},
				errors:{
					title:"Errores Importantes",
					loadErrors: "Mostrar Lista de Errores",
					loading: "Cargando Errores ...",
					loadingError: "Error al cargar los registros. Intentelo más tarde.",
					loadingSuccess: "Errores cargados.",
					noRecords: "No se encontraron Errores.",
					deleteBtn: "Eliminar Error", readBtn:"Marcar Leído", unreadBtn:"Marcar No Leído",
					table:{
						user: "Usuario Impactado", error:"Error", date:"Fecha"
					}
				}
			},
			user:{
				groups:{
					title:"Mis Grupos Familiares",
					description: "Grupos familiares a los que tengo acceso."
				},
				contactsList:{
					title:"Miembros de mis Grupos Familiares",
					noContactsError: "No encontramos ningun contacto."
				}
			},
			home:{
				title:"Inicio", welcome:"Hola",
				basicInfo: "Información Básica",
				address: "Dirección"
			},
			configs:{
				title:"Configuraciones", generalTitle:"General", reportsTitle:"Reportes",
				datesTitle:"Fechas",
				/*Group Confgs*/
				groupsTitle:"Grupos",	groupTypesLbl:"TIpos de Grupos",
				groupTypeDec:"Utiliza solo letras y números",
				appnameLbl:"Nombre de la Aplicación", appnameHint:"Okulus App",
				appNameDesc:"El nombre es usado en la barra de navegación.",
				locationDesc:"Usados en la dirección por defecto de Grupos y Miembros",
				maxQueryResultLbl:"Límite de Registros", maxQueryResultHint:"",
				maxQueryResultDesc:"Número máximo de registros regresados por la base de datos, en la consulta inicial.",
				showFilterAtLbl:"Mínimo para mostrar Filtro", showFilterAtHint:"",
				showFilterAtDesc:"Número mínimo de registros que deben existir para poder mostrar el 'Filtro'.",
				goodAttendanceLbl:"Buena asistencia", goodAttendanceHint:"",
				goodAttendanceDesc:"Cantidad considerada como buena asistencia.",
				excelentAttendanceLbl:"Excelente asistencia", excelentAttendanceHint:"",
				excelentAttendanceDesc:"Cantidad considerada como excelente asistencia.",
				minDurationLbl:"Duración mínima", minDurationHint:"",
				minDurationDesc:"Duración minima de una renion, en minutos.",
				maxDurationLbl:"Duración máxima", maxDurationHint:"",
				maxDurationDesc:"Duración máxima de una renion, en minutos.",
				maxMultipleGuestsLbl:"Límite de Invitados múltiples",
				maxMultipleGuestsDesc:"Cantidad máxima de invitados que se generan a la vez.",
				minReportsDateLbl:"Fecha mínima para reportes",
				minReportsDateDesc:"La fecha mínima que puede tener un reporte, o una semana.",
				minBdateLbl:"Fecha mínima de nacimiento",
				minBdateDesc:"La fecha de nacimiento más antigua que puede tener mimebro.",
				showMoneyLbl:"Ofrenda",
				showMoneyYesLbl:"Mostrar Ofrenda", showMoneyNoLbl:"No mostrar Ofrenda",
				showMoneyDesc:"Mostrar campos relacionados a Ofrenda",
				dateTimeFormatLbl:"Formato de Fecha y Hora", dateTimeFormatDesc:"",
				dateFormatLbl:"Formato de Fecha", dateFormatDesc:"",
				timeFormatLbl:"Formato de Hora", timeFormatDesc:"",
				saveBtn:"Guardar Configuraciones",
				noGroupTypesList:"No se ha registrado Tipos de Grupos"
			},
			success:{
				deleted:{
					title:"Eliminado el registro ..."
				}
			},
			error:{
				title: "Houston, Tenemos Problemas!",
				lead: "Lo sentimos, pero algo salió mal.",
				genericMessage:"Haz iniciado sesión correctamente, pero algo salió mal.",
				message:"Houston, Tenemos Problemas!"
			},
			dropdowns:{
				status:{
					label: "Activo/Inactivo",
					inactive: "Inactivo",
					active: "Activo"
				},
				weekdays:{
					mon:"Lunes", tue:"Martes", wed:"Miercoles", thu:"Jueves",
					fri:"Viernes", sat:"Sabado", sun:"Domingo"
				}
			}
		};
});
