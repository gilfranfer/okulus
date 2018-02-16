okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.config ={
			env: "dev",
			bday:{maxDate:"2017-12-31",minDate:"1900-01-01"},
			week:{maxDate:"2018-12-31",minDate:"2018-01-01"},
			reports:{
						maxDate:"2018-12-31",minDate:"2017-01-01",
						minDuration:"0", maxDuration:"300"
					}
		};

		$rootScope.i18n = {
			navigation:{
				brand:"PIB Xalapa",
				register:"Registrarse",
				login:"Iniciar Sesión",
				admin:{
					menu: "Admin",
					dashboard:"Dashboard",
					groups: "Grupos",
					members: "Miembros",
					weeks: "Semanas",
					reports: "Reportes",
					monitor:"Monitor"
				},
				user:{groups:"Mis Grupos", reports:"Mis reportes"
				}
			},
			btns:{
				saveBtn: "Guardar", newBtn: "Nuevo", deleteBtn: "Eliminar",
				cancelBtn: "Cancelar", sendBtn: "Enviar", yesBtn: "Si!", noBtn: "No!",
				newgroupBtn: "Nuevo", newMemberBtn: "Nuevo", addBtn: "+", viewBtn: "Ver",
				openBtn: "Abrir", closeBtn: "Cerrar", returnBtn:"Regresar",
				addReport: "+ Reporte", accessRules:"Accesos", analytics: "Analizar",
				provideAddress:"Proporcionar Direción", notProvideAddress:"No Proporcionar Direción",
				login:"Iniciar Sesión", register:"Registrarse"
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
					legend: "Datos del miembro",
					fnameLbl:"Nombre", fnameHint:"Francisco Fernando",
					lnameLbl:"Apellido", lnameHint:"Gil Villalobos",
					snameLbl:"Alias", snameHint:"Fernando Gil",
					emailLbl:"Correo", emailHint:"micorreo@gmail.com",
					bdayLbl:"Fecha de nacimiento",
					baseGroupLbl: "Grupo Base"
				},
				report:{
					title:"Datos generales de la Reunión",
					groupLbl:"Grupo", leadLbl: "Siervo",
					coLeadLbl: "Aprendiz", hostLbl: "Anfitrión",
					dateLbl: "Fecha de reunión", dateHint: "12/22/2017",
					durationLbl: "Duración (min)",
					weekLbl:"Semana", moneyLbl: "Ofrenda",
					statusLbl:"Estado de la Reunión",
					cancelStatusLbl:"Cancelada", okStatusLbl:"Realizada",
					notesLegend: "Notas", notesHint: "Agregar notas y comentarios de la reunión",
					attendanceLegend: "Asistencia",
					membersLbl: "Miembros", guestsLbl: "Invitados",
					maleLbl: "Hombres", femaleLbl: "Mujeres",
					maleAbrev: "H", femaleAbrev: "M",
					adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
					studyLegend: "Estudio", studyLbl: "Titulo", seriesLbl: "Serie"
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
					noMembersError: "No se han creado Miembros"
				},
				weeksList:{noWeeksError: "No se han creado Semanas"},
				access:{
					title: "Miembros con Accceso al Grupo",
					description: "Seleccionar un Miembro de la lista para otrogarle acceso al Grupo.",
					noRecordsError: "No hay reglas de acceso en este grupo",
					table:{
						memberName:"Miembro", memberId:"Id", date:"Desde"
					}
				},
				dashboard:{
					counters:{
						groups: "Grupos Existentes", activeGroups:"Grupos Activos", inactiveGroups:"Grupos Inactivos",
						members: "Miembros Existentes", activeMembers:"Miembros Activos", inactiveMembers:"Miembros Inactivos",
						totalReports: "Reuniones", successReports: "Realizadas", canceledReports: "Canceladas"
					},
					titles:{
						weekSection: "Buscador de Reportes",
						reportsList: "Reportes",
						attendance: "Asistencia",
						money: "Diezmo",
					},
					reportTable:{
						report:"", week:"Semana",
						date:"Fecha de Creación",
						group:"Grupo",
						reunionStatus:"Reunión",
						duration: "Duración",
						money: "Diezmo",
						attendance: "Asistencia", view: "Ver"
					},
					weekSection:{
						description:"Elige una semana, o un rango de semanas, para ver los Reportes y los gráficos de análisis. Es posible limitar la busqueda a un grupo especifico.",
						from: "De la Semana:", to:"a la Semana:", group:"Grupo", resultsLoaded: "Reportes encontrados",
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
					norecords: "No hay registros disponibles",
					table:{
						action: "Accion", by:"Hecha por", on:"Hecha en", date:"Fecha"
					}
				}
			},
			user:{
				//For User Views
				groupsList:{
					title:"Mis Grupos Familiares",
					description: "Infromación sobre mis Grupos Familiares activos.",
					noGroupsError: "No tienes Grupos asiganos."
				}
			},
			success:{
				deleted:{
					title:"Eliminado el registro ..."
				}
			},
			error:{
				title:"Oooops!!",
				recordDoesntExist: "Información no Disponible",
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
					mix:"Mixto", men:"Hombres",women:"Mujeres",young:"Jovenes",pilot:"Piloto"
				}
			}
		};

	}
]);
