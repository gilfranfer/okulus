/* Messages send from the backend. Usually used in Alert divs */
const systemMsgs = {
	error:{
		loadingRecords:"Error al cargar los registros.",
		noRecords:"No se encontraron registros.",
		nologin: "Necesitas iniciar sesión para ver este contenido.",
		noPrivileges: "No cuentas con los permisos necesarios para ver este contenido.",
		noPrivilegesShort: "No cuentas con los permisos necesarios.",
		rootAlreadySet:"El Super Usuario ya existe.",
		inactiveUserLogged:"Su Usuario ha sido desactivado. Contacte al Administrador.",
		/* AuthenticationCntrl*/
		memberlinkedDoesntExist: "El Miembro asociado al Usuario ya no existe.",
		memberAndUserEmailMismatch: "El Correo del Miembro no coincide con el del Usuario.",
		memberNotActiveUser: "El Miembro asociado/encontrado no está activo.",
		referenceRemoved: "Se ha borrado la referencia entre el Usuario y el Miembro.",
		contactAdmin: "Contacta al Administrador del Sistema.",
		noMemberFound: "No se encontró un Miembro con el correo electrónico:",
		moreThanOneMemberFound: "Existe mas de un Miembro con el correo electrónico:",
		pwdResetEmailError: "Ha sucedido un Error. Revisa el correo proporcionado o comunícate con el Administrador.",
		registerEmailNotAllowed: "El correo proporcionado no puedes ser registrado. Contacte al Administrador.",
		/*LoginCntrl*/
		incorrectCredentials: "Usuario o Contraseña Incorrectos",
		/* RegistrationCntrl */
		emailExist: "El correo electrónico ya está en uso.",
		tryAgainLater: "Hubo un error. Intente más tarde.",
		noMemberAssociated:"Tu cuenta ha sido desactivada, o no cuentas con un Miembro asociado. Contacta al administrador.",
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
		updateReqFailed: "No se puede modificar la Solicitud.",
		approvedReqFailed: "No se puede aprobar la Solicitud.",
		rejectReqFailed: "No se puede rechazar la Solicitud.",
		deleteReqFailed: "No se puede elminar la Solicitud.",
		noMemberRequestsFound: "No se encontraron Solicitudes.",
		/* Users JS*/
		noUsersError:"No se encontraron Usuarios"
	},
	inProgress:{
		sendingPwdResetEmail:"Enviando Correo...",
		logingUser: "Iniciando sesión...",
		registeringUser: "Registrando Usuario...",
		loading:"Cargando ...",
		loadingRecords:"Cargando Información ...",
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
		allGroupsTitle:"Grupos Existentes",
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
		memberCreatedFromRequest:"La Solicitud ha sido Aprobada. Nuevo Miembro creado.",
		requestRejected:"La Solicitud ha sido Rechazada",
		requestUpdated:"La Solicitud ha sido Actualizada",
		requestDeleted:"La Solicitud ha sido Eliminada",
		pendingRequestsTitle:"Solicitudes Pendientes",
		approvedRequestsTitle:"Solicitudes Aprobadas",
		rejectedRequestsTitle:"Solicitudes Rechazadas",
		/* Users JS */
		allUsersTitle:"Usuarios Existentes", activeUsersTitle: "Usuarios Activos",	inactiveUsersTitle: "Usuarion Inactivos",
		adminUsersTitle:"Usuarios Administradores", normalUsersTitle:"Usuarios Normales", rootUsersTitle:"Super Usuarios"
	},
	/* Notification Descriptions */
	notifications:{
		userCreated:"Se ha creado un nuevo Usuario.",
		rootCreated:"Se ha creado un nuevo Super Usuario.",
		/* Groups */
		groupCreated:"Grupo Creado: ",
		groupUpdated:"Grupo Actualizado: ",
		groupDeleted:"Grupo Eliminado: ",
		groupSetActive:"Grupo Activo: ",
		groupSetInactive:"Grupo Inactivo: ",
		groupHostUpdated:"Anfitrión actualizado. Grupo: ",
		groupLeadUpdated:"Lider actualizado. Grupo: ",
		groupTraineeUpdated:"Aprendiz actualizado. Grupo: ",
		gotAccessToGroup:"Recibió acceso al Grupo: ",
		lostAccessToGroup:"Perdió acceso al Grupo: ",
		/* Members */
		memberCreated:"Miembro Creado: ",
		memberUpdated:"Miembro Actualizado: ",
		memberDeleted:"Miembro Eliminado: ",
		memberSetActive:"Miembro Activo: ",
		memberSetInactive:"Miembro Inactivo: ",
		memberSetLead:"Role de Líder asignado a ",
		memberSetHost:"Role de Anfitrión asignado a ",
		memberSetTrainee:"Role de Aprendíz asignado a ",
		memberRemovedLead:"Role de Líder removido a ",
		memberRemovedHost:"Role de Anfitrión removido a ",
		memberRemovedTrainee:"Role de Aprendíz removido a ",
		baseGroupUpdated:"Grupo base actualizado para el miembro ",
		memberAddressRemoved:"Dirección eliminada, para el miembro ",
		memberAddressAdded:"Dirección agregada, para el miembro ",
		memberAddressUpdated:"Dirección actualizada, para el miembro ",
		memberCanBeUser:" puede crear Usuario.",
		memberCannotBeUser:" no puede crear Usuario.",
		/* Reports */
		reportCreated:"Reporte Creado",
		reportUpdated:"Reporte Actualizado",
		reportDeleted:"Reporte Eliminado",
		reportApproved:"Reporte Aprobado",
		reportRejected:"Reporte Rechazado",
		/* Weeks */
		weekCreated:"Semana Creada: ",
		weekUpdated:"Semana Actualizada: ",
		weekDeleted:"Semana Eliminada: ",
		weekOpened:"Semana Abierta: ",
		weekClosed:"Semana Cerrada: ",
		weekVisible:"Semana Visible: ",
		weekHiden:"Semana Oculta: ",
		/* Users */
		userSetActive:"Usuario Activo: ",
		userSetInactive:"Usuario Inactivo: ",
		userSetAdminRole:"Rol de Administrador asignado a ",
		userRemoveAdminRole:"Rol de Administrador removido a ",
		/* Requests */
		memberRequested:"Se ha solicitado la creación de un Miembro",
		memberRequestedUpdated:"Solicitud de Miembro Modificada",
		memberRequestDeleted:"Solicitud de Miembro Eliminada",
		memberRequestApproved:"Solicitud de Miembro Aprobada",
		memberRequestRejected:"Solicitud de Miembro Rechazada"
	}
};

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
					reports: "Reportes", monitor:"Errores", config:"Configuración",
					reunions:"Reuniones", requests:"Solicitudes", users:"Usuarios"
				}
			},
			home:{
				title:"Inicio", welcome:"Hola",
				basicInfo: "Información Básica",
				address: "Dirección"
			},
			profile:{
				lastLogin: "Última sesión:",
				lastActivity: "Última actividad:",
				sessionStatusLbl:"Estado de la sesión",
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
				loadingSuccess:"Reportes Cargados", loadPending1: "Mostar ", loadPending2: "Reportes restantes.",
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
				allReportsLbl:"Todos los Reportes", underReviewLbl:"En Revisión", pendingReviewLbl:"Por Revisar",
				totalReportsLbl:"Reportes Existentes", totalLbl:"Existentes",
				approvedReportsLbl:"Reportes Aprobados", approvedLbl:"Aprobados",
				rejectedReportsLbl:"Reportes Rechazados", rejectedLbl:"Rechazados",
				pendingReportsLbl:"Reportes Pendientes", pendingLbl:"Pendientes",
				approvedReport: "Reporte Aprobado", rejectedReport:"Reporte Rechazado", pendingReport:"Reporte en Revisión",
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
				studyLbl: "Titulo", seriesLbl: "Serie",
				noMembersList:"No se ha registrado la asistencia de Miembros",
				noGuestsList:"No se ha registrado la asistencia de Invitados",
				reportEvalLegend:"Evaluación del Reporte", feedbackLbl:"Discusión"
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
        totalWeeksLbl:"Semanas Existentes", totalLbl:"Existentes",
				openWeeksLbl: "Semanas Abiertas", openLbl: "Abiertas",
				closedWeeksLbl:"Semanas Cerradas", closedLbl:"Cerradas",
        visibleWeeksLbl: "Semanas Visibles", visibleLbl: "Visibles",
				hiddenWeeksLbl:"Semanas Ocultas", hiddenLbl:"Ocultas",
        /* Badges */
        status:{openLbl:"Abierta", closedLbl:"Cerrada",
        showLbl:"Visible", hideLbl:"Oculta"},
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
			users:{
				adminTitle:"Administrador de Usuarios",
				totalUsersLbl:"Usuarios Existentes", totalLbl:"Existentes",
				activeUsersLbl:"Usuarios Activos", activeLbl:"Activos",
				inactiveUsersLbl:"Usuarios Inactivos", inactiveLbl:"Inactivos",
				loadAllBtn:"Todos los Usuarios", newBtn:"Nuevo Usuario",
				userTypeLbl:"Tipo de Usuario",
				/*Alert Messages*/
				loadingSuccess: "Usuarios Cargados.",
				loadPending1: "Mostar ", loadPending2: "Usuarios restantes.",
				status:{activeLbl:"Activo", inactiveLbl:"Inactivo",
					onlineLbl:"Conectado", offlineLbl:"Desconectado",noMemberLbl:"Sin Miembro"},
				setActiveLbl:"Activar Usuario", setInactiveLbl:"Desactivar Usuario",
				setAdminRoleLbl:"Hacer Administrador", removeAdminRoleLbl:"Remover Administrador"
			},
			roles:{
				rootLbl:"Super Usuario", adminLbl:"Administrador", userLbl:"Usuario",
				rootsLbl:"Super Usuarios", adminsLbl:"Administradores", usersLbl:"Usuarios"
			},
			members:{
				memberLbl:"Miembro", membersLbl:"Miembros",
				/* Admin Members */
				adminTitle:"Administrador de Miembros",
				/* Global Badges */
				totalMembersLbl:"Miembros Existentes", totalLbl:"Existentes",
				activeMembersLbl:"Miembros Activos", activeLbl:"Activos",
				inactiveMembersLbl:"Miembros Inactivos", inactiveLbl:"Inactivos",
				/*Roles*/
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
				status:{activeLbl:"Miembro Activo", inactiveLbl:"Miembro Inactivo"},
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
				userSection: "Usuario",
				memberHasUser:"Éste Miembro ya tiene un usuario asociado.", goToUser:"Ver Usuario",
				allowUser:"Permitir que este Miembro se registre como Usuario?",
				setEmailFirst:"El Miembro debe tener un correo electrónico asignado."
			},
			requests:{
				requestLbl:"Solicitud", requestsLbl:"Solicitudes",
				myRequestsTitle:"Mis Solicitudes de Miembros", adminTitle:"Solicitudes de Creación de Miembros",
				memberRequestTitle:"Solicitud de Creación de Miembro.",
				pendingLbl:"Pendientes", approvedLbl:"Aprobadas", rejectedLbl:"Rechazadas",
				allRequestsLbl:"Todas las Solicitudes",
				loadedLbl:"Solicitudes Cargadas",
				loadPending1: "Mostar ", loadPending2: "Solictudes restantes.",
				pendingReviewShortLbl:"Por Revisar",
				pendingRequestsLbl:"Solicitudes en Revisión",	pendingRequestLbl:"Solicitud en Revisión", pendingShortLbl:"En Revisión",
				approvedRequestsLbl:"Solicitudes Aprobadas", approvedRequestLbl:"Solicitud Aprobada", approvedShortLbl:"Aprobadas",
				rejectedRequestsLbl:"Solicitudes Rechazadas",	rejectedRequestLbl:"Solicitud Rechazada", rejectedShortLbl:"Rechazadas",
				newMemberRequest:"Nueva Solicitud", openRequestBnt:"Ver Solicitud", myRequests:"Mis Solicitudes",
				admin:{
					donotCreateRequests:"Como Aministrador, puedes crear miembros sin necesidad de una Solicitud",
					pendingLbl:"Solicitudes por Revisar", approvedLbl:"Solicitudes Aprobadas",
					rejectedLbl:"Solicitudes Recahzadas", canceledLbl:"Solicitudes Canceladas"
				}
			},
			groups:{
				groupLbl:"Grupo", groupsLbl:"Grupos",
				/* Admin Groups */
				adminTitle:"Administrador de Grupos Familiares",
				/*Badges*/
				totalGroupsLbl:"Grupos Existentes", totalLbl:"Existentes",
				activeGroupsLbl:"Grupos Activos", activeLbl:"Activos",
				inactiveGroupsLbl:"Grupos Inactivos", inactiveLbl:"Inactivos",
				/* status */
				status:{
					activeLbl:"Activo", inactiveLbl:"Inactivo"
				},
				/*Buttons*/
				loadBtn:"Todos los Grupos", goToBtn:"Ver Grupos",
				newBtn:"Nuevo Grupo", saveBtn:"Guardar",
				editBtn:"Editar Grupo", deleteBtn:"Eliminar Grupo",
				/*Alert Messages*/
        loadingSuccess: "Grupos Cargados.", loadPending1: "Mostar ", loadPending2: "Grupos restantes.",
				/* Form Labels */
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
				accessDescription: "Proporcionar acceso a un Usuario le permite crear reportes para el grupo y ver la información histórica del mismo.",
				aceessInactiveGroup:"No pueden agregarse nuevas reglas a Grupos Inactivos.",
				noRulesMessage: "No hay reglas de acceso en este grupo",
				table:{
					memberName:"Miembro", memberId:"Id", date:"Desde"
				},
				/* Modal */
				selectGroupTitle:"Seleccionar Grupo"
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
				approval:"Aprobación", rejection:"Rechazo"
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar", updateBtn:"Actualizar",
				approveBtn:"Aprobar" , rejectBtn:"Rechazar", requestBtn:"Solicitar",
				commentBtn:"Comentar", returnBtn:"Regresar",
				yesBtn: "Sí", noBtn: "No",
				addBtn: "+", here:"aquí",
				/** Access Rules **/
				addReport: "Crear Reporte", accessRules:"Reglas de Accesos"
			},
			alerts:{
				loading:"Cargando ...", confirmQuestion: "Seguro?"
			},
			filterBox:{
				searchHint:"Buscar ...",
				filterHint:"Filtrar resultados ..."
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
				noReportsError: "No hay reportes disponibles para las opciones seleccionadas",
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
				title:"Resumen del Sistema"
			},
			statistics:{
				adminTitle:"Estadísticas de los Grupos",
				userTitle:"Estadísticas de mis Grupos"
			},
			admin:{
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
			mygroups:{
				title:"Mis Grupos Familiares",
				description: "Grupos familiares a los que tengo acceso."
			},
			mycontacts:{
				title:"Miembros de mis Grupos Familiares",
				noContactsError: "No encontramos ningun contacto."
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
			weekdays:{
				mon:"Lunes", tue:"Martes", wed:"Miercoles", thu:"Jueves",
				fri:"Viernes", sat:"Sabado", sun:"Domingo"
			}
		};
});
