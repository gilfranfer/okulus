okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.config ={
			env: "prod",
			bday:{maxDate:"2018-12-31",minDate:"1900-01-01"},
			week:{maxDate:"2018-12-31",minDate:"2018-01-01"},
			reports:{
						maxDate:"2018-12-31",minDate:"2018-01-01",
						minDuration:"0", maxDuration:"300"
					}
		};

		$rootScope.i18n = {
			navigation:{
				brand:"PIB Xalapa",
				register:"Registrarse",
				login:"Iniciar Sesión",
				logout:"Salir",
				home:"Inicio",
				admin:{
					menu: "Admin",
					dashboard:"Dashboard",
					groups: "Grupos",
					members: "Miembros",
					weeks: "Semanas",
					reports: "Reportes",
					monitor:"Monitor"
				},
				user:{groups:"Mis Grupos", reports:"Ver Reportes", contacts:"Mis Contactos"
				}
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
				invalidForm:"Hay datos faltantes o incorrectos en el formulario.",
				confirmDelete: "Seguro que deseas eliminar este registro?",
				loading:"Cargando ..."
			},
			forms:{
				weeks:{
					legend: "Semanas",
					description:"Las Semanas serán los contenedores de los Reportes. Se recomienda cerrar las semanas cuando se hayan recibido todos los reportes. Las semanas cerradas no aparecerán listadas al momento de crear un reporte.",
					week: "Semana",weekBtn:"Agregar",
					weekName: "Nombre", weekNameHint: "Semana 1",
				},
				group:{
					legend: "Datos del Grupo",
					numberLbl:"#", numberHint:"1", typeLbl:"Tipo",
					nameLbl:"Nombre del Grupo", nameHint:"Semillas de Esperanza",
					emailLbl:"Correo", emailHint:"micorreo@gmail.com",
					shcLegend:"Horario de Servicio",
					schdDayLbl: "Día", schdTimeLbl: "Hora", schdTimeHint: "07:30 PM"
				},
				member:{
					legend: "Información básica", membership:"Membresía",
					fnameLbl:"Nombre", fnameHint:"Francisco Fernando",
					lnameLbl:"Apellido", lnameHint:"Gil Villalobos",
					snameLbl:"Alias", snameHint:"Fernando Gil",
					emailLbl:"Correo", emailHint:"micorreo@gmail.com",
					bdayLbl:"Fecha de nacimiento",
					baseGroupLbl: "Grupo Base",
					canBeUserLbl: "Puede ser Usuario?",
					typeLbl:"Tipo de Miembro", isHostLbl:"Es Anfitrión?",
					isLeadLbl:"Es Siervo Líder?", isTraineeLbl:"Es Siervo Aprendíz?"
				},
				report:{
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
					membersLbl: "Miembros del Grupo", guestsLbl: "Invitados", allMembersLbl:"Todos los miembros",
					maleLbl: "Hombres", femaleLbl: "Mujeres",
					maleAbrev: "H", femaleAbrev: "M",
					adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
					studyLegend: "Estudio", studyLbl: "Titulo", seriesLbl: "Serie",
					noMembersList:"No se ha registrado la asistencia de Miembros",
					noGuestsList:"No se ha registrado la asistencia de Invitados"
				},
				phone:{
					phoneLbl:"Teléfono", phoneHint:"228 8112233"
				},
				search:{
					hint:"Buscar ..."
				},
				address:{
					legend: "Dirección",
					streetLbl:"Calle", streetHint:"Av. Principal",
					extNumberLbl: "Num ext", extNumberHint: "007",
					intNumberLbl: "Num int", intNumberHint: "1",
					zipLbl: "Codigo Postal", zipHint: "77777",
					cityLbl: "Ciudad", cityHint: "Xalapa",
					neighborhoodLbl: "Colonia", neighborhoodHint: "Centro",
					stateLbl: "Estado", stateHint: "Veracruz",
					countryLbl: "Pais", countryHint: "Mexico"
				},
				orgForm:{
					basicInfoFieldset: "Datos de la Organizacion",
					orgnameLbl:"Nombre de la Organizacion", orgNameHint: "Mi Organizacion",
					emailLbl:"Correo electronico", emailHint:"micorreo@gmail.com",
					urlLbl:"Sitio Web", urlHint:"http://www.misitio.com"
				},
				login:{
					title:"Inicia sesión",
					email:"Correo Electrónico", emailHint:"micorreo@gmail.com",
					password: "Contraseña", passwordHint: "Tus palabras secretas",
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
				}
			},
			admin:{
				//For Admin Views
				groupsList:{
					title:"Administrar Grupos Familiares",
					description: "A countinuación se muestran todos los Grupos Familiares registrados, incluyendo los inactivos.",
					noGroupsError: "No se han creado Grupos"
				},
				membersList:{
					title:"Administrar Miembros del Grupo de Siervos",
					description: "A countinuación se muestran todos los Miembros registrados, incluyendo los inactivos, que forman parte del Grupo de Siervos.",
					noMembersError: "No se han creado Miembros",
					allMembersLabel:"Todos", hostLabel: "Anfitriones", leadLabel:"Líderes", traineeLabel: "Aprendíces"
				},
				weeksList:{noWeeksError: "No se han creado Semanas"},
				access:{
					title: "Accceso al Grupo",
					description: "Otorgar acceso a un Usuario le permite crear reportes para el grupo y ver la información histórica del mismo. La lista muestra solo los miembros que tiene permiso para ser Usuarios del sistema.",
					noRecordsError: "No hay reglas de acceso en este grupo",
					table:{
						memberName:"Miembro", memberId:"Id", date:"Desde"
					}
				},
				dashboard:{
					counters:{
						total: "Existentes", active:"Activos", inactive:"Inactivos",
						approved:"Aprobados", pending:"Sin Revisar", rejected: "Rechazados",
						totalAttendance:"Personas Ministradas", totalDuration:"Minutos Ministrados",
						totalMoney:"Ofrenda", successReunions: "Reuniones Completadas", canceledReunions: "Reuniones Canceladas"
					},
					titles:{
						weekSection: "Buscador de Reportes",
						reportsList: "Reportes",
						attendance: "Reuniones y Asistencia",
						money: "Ofrenda",
						duration: "Duración"
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
						description:"Elige una semana, o un rango de semanas, para ver los Reportes y los gráficos de análisis. Es posible limitar la busqueda a un grupo especifico.",
						from: "De la Semana:", to:"a la Semana:", group:"Grupo",
						chartOrientation:"Gráficas", chartOrientationLandscape:"Horizontal", chartOrientationPortrait: "Vertical",
						resultsLoaded: "Reportes encontrados",
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
					table:{
						user: "Usuario", type:"Tipo",created:"Desde", lastLogin:"Última Sesión",
						lastActivity:"Última Actividad", sessionStatus:"Estado"
					}
				},
				errors:{
					table:{
						user: "Usuario Impactado", error:"Error", date:"Fecha"
					}
				}
			},
			user:{
				//For User Views
				groupsList:{
					title:"Mis Grupos Familiares",
					description: "Infromación sobre mis Grupos Familiares activos.",
					noGroupsError: "No tienes Grupos asiganos."
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
				nomemberAssociated:"Haz iniciado sesión correctamente, pero tu usuario no se encuentra asociado a ningún miembro activo. Ponte en contacto con el administrador."
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
					mix:"Mixto", men:"Hombres",women:"Mujeres",young:"Jovenes",pilot:"Piloto"
				}
			}
		};

	}
]);
