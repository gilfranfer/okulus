/* Messages send from the backend. Usually used in Alert divs */
const systemMsgs = {
	error:{
		nologin: "Necesitas iniciar sesión para ver este contenido.",
		/* AuthenticationCntrl*/
		memberlinkedDoesntExist: "El Miembro asociado al Usuario ya no existe.",
		memberAndUserEmailMismatch: "El Correo del Miembro no coincide con el del Usuario.",
		memberNotActiveUser: "El Miembro asociado/encontrado no es un Usuario activo.",
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
		noMemberAssociated:"No cuentas con un Miembro asociado a tu cuenta. Contacta al administrador."
	},
	inProgress:{
		sendingPwdResetEmail:"Enviando Correo...",
		logingUser: "Iniciando sesión...",
		registeringUser: "Registrando Usuario...",
		loading:"Cargando ...",
		loadingAllMembers:"Cargando Todos los Miembros ...",
		loadingActiveMembers:"Cargando Miembros Activos ...",
		loadingInactiveMembers:"Cargando Miembros Inactivos ...",
		loadingLeadMembers:"Cargando Miembros Líderes ...",
		loadingHostMembers:"Cargando Miembros Anfitriones ...",
		loadingTraineeMembers:"Cargando Miembros Aprendices ..."
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
		hostMembersTitle:"Miembros Anfitriones"
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
		[constants.folders.groups,"Grupo"],
		[constants.folders.members,"Miembro"],
		[constants.folders.reports,"Reporte"],
		[constants.folders.weeks,"Semana"],
		[constants.folders.users,"Usuario"] ]);

/** Using a run function to set the language in the rootScope **/
okulusApp.run(function($rootScope) {
		$rootScope.i18n = {
			navigation:{
				brand:"Grupos PIB Xalapa", home:"Inicio",
				register:"Registrarse", login:"Iniciar Sesión", logout:"Cerrar Sesión",
				chat:"Conversaciones", notifications:"Notificaciones",
				groups:"Mis Grupos", reports:"Ver Reportes", contacts:"Mis Contactos",
				backToHome: "Regresar a la Página de Inicio",
				admin:{
					menu: "Administrador", dashboard:"Escritorio",
					groups: "Grupos", members: "Miembros",
					weeks: "Semanas", reports: "Reportes",
					monitor:"Monitor", config:"Configuración"
				}
			},
			profile:{
				lastLogin: "Última sesión:",
				lastActivity: "Última actividad:",
				viewProfileBtn: "Ver Perfil"
			},
			launchpad:{
				title:"Acciones rápidas", createReport:"Crear Reporte"
			},
			msgCenter:{
				title: "Mensajes del Administrador",
				instruction: "Usa el cuadro de texto para redactar un mensaje a los usuarios:",
				importanMsg: "Mensaje Importante", deleteMsg: "X Eliminar Mensaje",
				loadingMessages: "Cargando mensajes ...",
				loadingError: "Error al cargar los mensajes. Intentelo más tarde.",
				noMessages: "No hay mensajes.",
				createInProgress: "Publicando mensaje ...",
				createSuccess: "El mensaje ha sido publicado.",
				createError: "Error al crear el mensaje. Intentelo más tarde.",
				deleteInProgress: "Eliminando mensaje ...",
				deleteSuccess: "El mensaje ha sido eliminado.",
				deleteError: "Error al eliminar el mensaje. Intentelo más tarde.",
				onlyAdmin: "Debes ser administrador."
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
				email:"Correo Electrónico", emailHint:"micorreo@gmail.com",
				invalidEmail:"Ese no es un correo válido",
				password: "Contraseña", passwordHint: "Tus palabras secretas",
				pwdRequired:"La contraseña es requerida", forgotPwd: "Olvidé mi contraseña",
				resetPwd: "Restablecer contraseña",
			},
			register:{
				title:"Regístrate",
				email:"Correo Electrónico", emailHint:"micorreo@gmail.com",
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
					deleteMessageTitle:"Eliminar Mensaje",
					deleteForMeBtn:"Eliminar para mí",
					deleteForAllBtn:"Eliminar para todos",
					editMessageTitle:"Editar Mensaje"
				}
			},
			weeks:{
				title: "Administrador de Semanas",
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
        loadBtn:"Todas las Semanas", newBtn:"Crear Semana",
        openBtn:"Abrir", closeBtn:"Cerrar",
        showBtn:"Mostrar", hideBtn:"Ocultar",
				editBtn:"Editar Semana",
        /*Alert Messages*/
        loading:"Cargando Semanas...", loadingSuccess: "Semanas Cargadas.",
        loadingError: "Error al cargar las Semanas. Intentelo más tarde.",
        noWeeksError: "No se encontraron Semanas.",
				deleteError:"No se puede eliminar la semana porque tiene 1 o más reportes.",
				statusUpdated:"Estado de la Semana actualizado.",
				visibilityUpdated:"Visibilidad de la Semana actualizada.",
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
				openStatusLbl:"Si / Semana Abierta", closedStatusLbl:"No / Semana Cerrada",
				visibilityLbl:"Se muestra en el buscador de Reportes? (Visibilidad)",
				showStatusLbl:"Si / Semana Visible", hideStatusLbl:"No / Semana Oculta",
				modifyLbl:"Modificar", newLbl: "Nueva"
			},
			members:{
				/* Admin Members */
				title:"Administrador de  Miembros",
				/* Global Badges */
				totalMembers:"Miembros Existentes",
				activeMembers:"Miembros Activos", inactiveMembers:"Miembros Inactivos",
				leadMembers:"Líderes", hostMembers:"Anfitriones", traineeMembers:"Aprendices",
				/*Buttons*/
				loadBtn:"Mostrar Miembros", newBtn:"Crear Miembro",
        /*Alert Messages*/
        loadingSuccess: "Miembros Cargados.",
				loadPending1: "Mostar ", loadPending2: "Miembros restantes.",
				/*Labels*/
				activeLbl:"Activo", inactiveLbl:"Inactivo",
				firstnameLbl:"Nombre",lastnameLbl:"Apellido",
				emailLbl:"Correo electrónico",phoneLbl:"Teléfono",
				filterDescription: "Usa el cuadro de texto para filtrar los resultados.",
				loading:"Cargando Miembros...", loadingSuccess: "Miembros Cargados.",
				loadingError: "Error al cargar los miembros. Intentelo más tarde.",
				noMembersError: "No se encontraron Miembros.",
				filterMemberType:"Tipo de Miembro", allMembersLabel:"Todos", hostLabel: "Anfitriones",
				leadLabel:"Líderes", traineeLabel: "Aprendíces"
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar",
				cancelBtn: "Cancelar", sendBtn: "Enviar", yesBtn: "Si!", noBtn: "No!",
				newgroupBtn: "Nuevo", newMemberBtn: "Nuevo", addBtn: "+", viewBtn: "Ver",
				openBtn: "Abrir", closeBtn: "Cerrar", returnBtn:"Regresar",
				addReport: "Crear Reporte", accessRules:"Reglas de Accesos", analytics: "Analizar",
				provideAddress:"Proporcionar Direción", notProvideAddress:"No Proporcionar Direción",
				login:"Iniciar Sesión", register:"Registrarse",
				requestCreationBtn:"Solicitar Creación",requestUpdateSaveBtn:"Solicitar Actualización",
				approveBtn:"Aprobar" , rejectBtn:"Rechazar"
			},
			alerts:{
				invalidForm:"Hay datos faltantes o incorrectos en el formulario. Revisa los campos marcados con *",
				confirmDelete: "Seguro que deseas eliminar este registro?",
				loading:"Cargando ...", working:"Estamos trabajando en tu solicitud ..."
			},
			forms:{
				audit:{
					title:"Auditoria", creation:"Creación", update:"Última Actualización",
					approval:"Aprobación", rejection: "Rechazo",
					refreshForUpdates: "Para ver actualizaciones de ésta sección, debes refrescar la página "
				},
				group:{
					newGroup: "Nuevo Grupo",
					basicDataLegend: "Datos del Grupo",
					numberLbl:"Número", numberHint:"", typeLbl:"Tipo",
					nameLbl:"Nombre", nameHint:"",
					emailLbl:"Correo", emailHint:"",
					shcLegend:"Horario de Servicio",
					typeLegend:"Tipo de Grupo",
					schdDayLbl: "Día", schdTimeLbl: "Hora", schdTimeHint: "",
					mandatoryFields: "Campos Obligatorios",
					active: "Grupo Activo", inactive: "Grupo Inactivo"
				},
				member:{
					newMember: "Nuevo Miembro",
					basicDataLegend: "Datos del Miembro", membership:"Membresía",
					fnameLbl:"Nombre", fnameHint:"",
					lnameLbl:"Apellido", lnameHint:"",
					snameLbl:"Alias", snameHint:"",
					emailLbl:"Correo", emailHint:"",
					bdayLbl:"Fecha de nacimiento",
					baseGroupLbl: "Grupo Base",
					canBeUserLbl: "Puede ser Usuario?",
					typeLbl:"Tipo de Miembro", isHostLbl:"Es Anfitrión?",
					isLeadLbl:"Es Siervo Líder?", isTraineeLbl:"Es Siervo Aprendíz?",
					active: "Miembro Activo", inactive: "Miembro Inactivo"
				},
				report:{
					newReport: "Nuevo Reporte", reunionLegend:"Reunión del Grupo",
					basicDataLegend: "Detalles de la Reunión",
					title:"Datos generales de la Reunión",
					groupLbl:"Grupo", leadLbl: "Siervo",
					coLeadLbl: "Aprendiz", hostLbl: "Anfitrión",
					dateLbl: "Fecha de reunión", dateHint: "12/22/2017",
					durationLbl: "Duración (min)",
					weekLbl:"Semana", moneyLbl: "Ofrenda",
					statusLbl:"Estado de la Reunión",
					cancelStatusLbl:"Cancelada", okStatusLbl:"Completada",
					pendingStatusLbl: "Pendiente", approvedStatusLbl:"Aprobado", rejectedStatusLbl:"Rechazado",
					notesLegend: "Notas", notesHint: "Agregar notas y comentarios de la reunión",
					attendanceLegend: "Asistencia",  attendanceList:"Lista de asistencia",
					membersLbl: "Miembros del Grupo", guestsLbl: "Invitados",
					allMembersLbl:"Ver todos los miembros", groupMembersLbl:"Ver miembros del Grupo",
					maleLbl: "Hombres", femaleLbl: "Mujeres",
					maleAbrev: "H", femaleAbrev: "M",
					adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
					studyLegend: "Estudio", studyLbl: "Titulo", seriesLbl: "Serie",
					noMembersList:"No se ha registrado la asistencia de Miembros",
					noGuestsList:"No se ha registrado la asistencia de Invitados",
					approvedReport: "Reporte Aprobado", rejectedReport:"Reporte Rechazado", pendingReport:"Reporte en Revisión"
				},
				phone:{
					phoneLbl:"Teléfono", phoneHint:""
				},
				search:{
					hint:"Buscar ..."
				},
				filter:{
					hint:"Filtrar resultados..."
				},
				address:{
					legend: "Dirección",
					streetLbl:"Calle", streetHint:"",
					extNumberLbl: "Num ext", extNumberHint: "",
					intNumberLbl: "Num int", intNumberHint: "",
					zipLbl: "Codigo Postal", zipHint: "",
					cityLbl: "Ciudad", cityHint: "",
					neighborhoodLbl: "Colonia", neighborhoodHint: "",
					stateLbl: "Estado", stateHint: "",
					countryLbl: "Pais", countryHint: ""
				}
			},
			admin:{
				//For Admin Views
				groups:{
					title:"Administrar Grupos Familiares",
					activeGroups:"Grupos Activos",
					inactiveGroups:"Grupos Inactivos",
					totalGroups:"Grupos Existentes",
					filterDescription: "Usa el cuadro de texto para filtrar los resultados.",
					loading:"Cargando Grupos...", loadingSuccess: "Grupos Cargados.",
					loadingError: "Error al cargar los grupos. Intentelo más tarde.",
					noGroupsError: "No se encontraron Grupos.",
					loadBtn:"Mostrar Grupos",
					newBtn:"Crear Grupo"
				},
				weeksList:{noWeeksError: "No se han creado Semanas"},
				access:{
					title: "Lista de acccesos al Grupo",
					description: "Otorgar acceso a un Usuario le permite crear reportes para el grupo y ver la información histórica del mismo. La lista muestra solo los miembros que tiene permiso para ser Usuarios del sistema.",
					noRecordsError: "No hay reglas de acceso en este grupo",
					table:{
						memberName:"Miembro", memberId:"Id", date:"Desde"
					}
				},
				dashboard:{
					counters:{
						total: "Total",
						active:"Activos", inactive:"Inactivos",
						approved:"Aprobados", pending:"Pendientes", rejected: "Rechazados",
						totalMembers: "Miembros", totalGuests: "Invitados",
						totalDuration:"Minutos Ministrados", totalMoney:"Ofrenda",
						successReunions: "Completadas", canceledReunions: "Canceladas"
					},
					titles:{
						weekSection: "Buscador de Reportes",
						reportsList: "Lista de Reportes", reportsSummary: "Reportes", reunionsSummary: "Reuniones",
						attendanceSummary:"Asistentes", othersSummary:"Otros",
						attendanceCharts: "Gráficas de Reuniones y Asistencia",
						moneyCharts: "Gráfica de Ofrenda",	durationCharts: "Gráfica de Duración"
					},
					reportTable:{
						report:"", week:"Semana",
						date:"Fecha de Creación",
						group:"Grupo",
						reunionStatus:"Reunión",
						reportStatus:"Reporte",
						duration: "Duración",
						money: "Ofrenda",
						attendance: "Asistencia", view: "Ver"
					},
					weekSection:{
						description:"Elige una semana, o un rango de semanas, para ver los Reportes y los gráficos de análisis. Puedes elegir uno o más grupos para comparar.",
						from: "De la Semana:", to:"a la Semana:", group:"Grupo", allGroups: "Todos los Grupos",
						chartOrientation:"Gráficas", chartOrientationLandscape:"Horizontal", chartOrientationPortrait: "Vertical",
						resultsLoaded: "Reportes encontrados"
					},
					noReportsError: "No hay reportes disponibles para las opciones seleccionadas",
					weeksOrderError: "Verifica el orden de las Semanas seleccionadas"
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
			success:{
				deleted:{
					title:"Eliminado el registro ..."
				}
			},
			error:{
				title: "Houston, Tenemos Problemas!",
				lead: "Lo sentimos, pero algo salió mal.",
				genericMessage:"Haz iniciado sesión correctamente, pero algo salió mal.",
				recordDoesntExist: "La información solicitada no está disponible, o puede que haya sido borrada.",
				noAdmin: "No cuentas con los permisos necesarios para ver este contenido.",
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
				},
				gtype:{
					mix:"Mixto", men:"Hombres",women:"Mujeres",young:"Jovenes",floating:"Flotante", reorg:"En Reestructura"
				}
			}
		};
});
