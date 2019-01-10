okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.config ={
			env: "prod",
			bday:{maxDate:"2018-12-31",minDate:"1900-01-01"},
			week:{maxDate:"2019-12-31",minDate:"2018-01-01"},
			reports:{
						maxDate:"2019-12-31",minDate:"2018-01-01",
						minDuration:"0", maxDuration:"300"
					}
		};

		$rootScope.i18n = {
			navigation:{
				brand:"Grupos PIB Xalapa",
				register:"Registrarse",
				login:"Iniciar Sesión",
				logout:"Cerrar Sesión",
				chat:"Conversaciones",
				notifications:"Notificaciones",
				home:"Inicio",
				admin:{
					menu: "Administrador",
					dashboard:"Dashboard",
					groups: "Todos los Grupos",
					members: "Todos los Miembros",
					weeks: "Semanas",
					reports: "Reportes",
					monitor:"Monitor"
				},
				user:{groups:"Mis Grupos", reports:"Ver Reportes", contacts:"Mis Contactos"
				}
			},
			chat:{
				emptyChat:"No hay mensajes en esta conversación",
				startConversation:"Abrir Conversación", noChats:"No hay Chats",
				usersList:"Lista de Usuarios", userChatsList:"Mis Conversaciones"
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar",
				cancelBtn: "Cancelar", sendBtn: "Enviar", yesBtn: "Si!", noBtn: "No!",
				newgroupBtn: "Nuevo", newMemberBtn: "Nuevo", addBtn: "+", viewBtn: "Ver",
				openBtn: "Abrir", closeBtn: "Cerrar", returnBtn:"Regresar",
				addReport: "+ Reporte", accessRules:"Accesos", analytics: "Analizar",
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
				weeks:{
					legend: "Semanas",
					description:"Las Semanas serán los contenedores de los Reportes. Se recomienda cerrar las semanas cuando se hayan recibido todos los reportes. Las semanas cerradas no aparecerán listadas al momento de crear un reporte.",
					week: "Semana",weekBtn:"Agregar",
					weekName: "Nombre", weekNameHint: "",
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
				},
				pwdReset:{
					title:"Restablecer contraseña",
				},
				login:{
					title:"Inicia sesión",
					email:"Correo Electrónico", emailHint:"micorreo@gmail.com",
					password: "Contraseña", passwordHint: "Tus palabras secretas",
					forgotPwd: "Restablecer mi contraseña",
					alert:{ invalidEmail:"Ese no es un correo válido", pwdRequired:"La contraseña es requerida" }
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
				verification:{
					emailNotVerifiedError: "Tu correo electrónico no ha sido verificado",
					reviewEmail:"Hemos mandado un mensaje de verificación a tu correo electrónico.",
					verify: "Mandar correo de verificación."
				}
			},
			admin:{
				//For Admin Views
				groupsList:{
					title:"Administrar Grupos Familiares",
					description: "A countinuación se muestran todos los Grupos Familiares registrados, incluyendo los inactivos.",
					noGroupsError: "No se encontraron Grupos"
				},
				membersList:{
					title:"Administrar Miembros del Grupo de Siervos",
					description: "A countinuación se muestran todos los Miembros registrados, incluyendo los inactivos, que forman parte del Grupo de Siervos.",
					noMembersError: "No se encontraron Miembros",
					allMembersLabel:"Todos", hostLabel: "Anfitriones", leadLabel:"Líderes", traineeLabel: "Aprendíces"
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
					title: "Auditoria de Movimientos",
					select: "Revisar Movimientos en ",
					groupsOptn:"Grupos",
					membersOptn:"Miembros",
					reportsOptn:"Reportes",
					weeksOptn:"Semanas",
					usersOptn:"Usuarios",
					messagesOptn:"Mensajes",
					norecords: "No hay registros disponibles",
					table:{
						action: "Accion", by:"Hecha por", on:"Hecha en", date:"Fecha"
					}
				},
				users:{
					title:"Usuarios Registrados",
					adminLbl: "Administrador", userLbl: "Usuario",
					table:{
						user: "Usuario", type:"Tipo",created:"Desde", lastLogin:"Última Sesión",
						lastActivity:"Última Actividad", sessionStatus:"Estado"
					}
				},
				errors:{
					title:"Errores Recientes",
					table:{
						user: "Usuario Impactado", error:"Error", date:"Fecha"
					}
				}
			},
			user:{
				//For User Views
				groupsList:{
					title:"Mis Grupos Familiares",
					description: "Infromación sobre mis Grupos Familiares activos."
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
			msgCenter:{
				messageCenter: "Mensajes del Administrador",
				messageCenterInstruction: "Escribe un mensaje y envialo",
				importanMsg: "Mensaje Importante",
				deleteMsg: "X Eliminar Mensaje"
			},
			notifications:{
				title:"Centro de Notificaciones", by:"por", noRecords:"No tienes ninguna notificación",
				new: "Nueva", deleateAll: "Eliminar Todo", cleanAll:"Marcar Todo como Leido"
			},
			success:{
				deleted:{
					title:"Eliminado el registro ..."
				}
			},
			error:{
				title:"Oooops!!",
				recordDoesntExist: "Información no Disponible",
				nologin: "Necesitas iniciar sesión para ver este contenido",
				message:"Houston, Tenemos Problemas!",
				nomemberAssociated:"Haz iniciado sesión correctamente, pero tu usuario no se encuentra asociado a ningún miembro activo. Ponte en contacto con el administrador.",
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

	}
]);
