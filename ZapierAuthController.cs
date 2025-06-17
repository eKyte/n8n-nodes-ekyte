using Applications.Web.Integrations.Email;
using Applications.Web.Integrations.S3;
using Applications.Web.Models.Request;
using AutoMapper;
using Domain.Entities.Companies;
using Domain.Entities.Companies.Relationships;
using Domain.Entities.Companies.Tickets;
using Domain.Entities.Users;
using Domain.Entities.Workspaces;
using Domain.Entities.Workspaces.Plans;
using Domain.Entities.Workspaces.Tasks;
using Domain.Repositories;
using Domain.Services;
using Domain.ValueObject.Enums;
using Domain.ValueObject.FiltersToGetEntities;
using Infrastructures.Utils.Extensions;
using Interfaces.Web.API.AspNetCore.Mvc.ModelBinding;
using Interfaces.Web.API.Filters;
using Interfaces.Web.API.Infrastructure.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Interfaces.Web.API.Controllers.ExternalApi.Zapier
{
    [Route("zapier")]
    public class ZapierAuthController : ExternalApiBaseController
    {
        private readonly UnitOfWork uow;
        private readonly IMapper mapper;
        private readonly EmailService emailService;
        private readonly TicketService ticketService;
        private readonly ProjectService projectService;
        private readonly ArtifactService artifactService;
        private readonly TaskFlowService taskFlowService;
        private readonly UserManager<EkyteUser> userManager;
        private readonly TaskIterationService taskIteration;
        private readonly UserAccessService userAccessService;
        private readonly AzureBlobStorageFileService amazonS3FileService;
        private readonly NotificationService notificationService;
        private readonly NotificationTicketService notificationTicketService;
        private readonly WorkspaceDuplicateService workspaceDuplicateService;

        public ZapierAuthController(UnitOfWork uow, IMapper mapper, EmailService emailService, TicketService ticketService, WorkspaceDuplicateService workspaceDuplicateService, ArtifactService artifactService, TaskFlowService taskFlowService, UserManager<EkyteUser> userManager, TaskIterationService taskIteration, UserAccessService userAccessService, AzureBlobStorageFileService amazonS3FileService, NotificationService notificationService, NotificationTicketService notificationTicketService, ProjectService projectService) : base(uow)
        {
            this.uow = uow;
            this.mapper = mapper;
            this.emailService = emailService;
            this.ticketService = ticketService;
            this.artifactService = artifactService;
            this.taskFlowService = taskFlowService;
            this.userManager = userManager;
            this.taskIteration = taskIteration;
            this.userAccessService = userAccessService;
            this.amazonS3FileService = amazonS3FileService;
            this.notificationService = notificationService;
            this.notificationTicketService = notificationTicketService;
            this.projectService = projectService;
            this.workspaceDuplicateService = workspaceDuplicateService;
        }

        #region HTTP GET

        [HttpGet("auth")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AuthZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(new { CompanyId = this.CurrentCompanyId });

        }

        [HttpGet("tasks")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTasksZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.CtcTask.GetZapierTasksAsync(this.CurrentCompanyId));
        }

        [HttpGet("v2/tasks")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTasksZapierV2([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.CtcTask.GetZapierTasksV2Async(this.CurrentCompanyId));
        }

        [HttpGet("projects/created")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTasksCreatedZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.CtcTaskProject.GetZapierProjectCreatedAsync(this.CurrentCompanyId));
        }


        [HttpGet("tickets/concluded")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTicketsConcludedZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.Ticket.GetTicketsZapierAsync(this.CurrentCompanyId, TicketZapierType.Concluded));
        }

        [HttpGet("tickets/changes")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTicketsChangesZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.Ticket.GetTicketsZapierAsync(this.CurrentCompanyId, TicketZapierType.Changes));
        }

        [HttpGet("notifications")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetZapierNotifications([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            var currentUser = await uow.Users.GetIQueryable().AsNoTracking().Where(u => u.Email == auth.UserEmail).FirstOrDefaultAsync();
            if (currentUser == null)
                return BadRequest(new { Id = 10, Text = $"Usuário {auth.UserEmail} não foi encontrado." });

            return Ok(await uow.Notification.GetZapierNotificationsAsync(this.CurrentCompanyId, currentUser.Id));
        }

        [HttpGet("boards")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBoardsZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.Plan.GetZapierBoardsAsync(this.CurrentCompanyId));
        }

        [HttpGet("workspaces")]
        [AllowAnonymous]
        [CaptureExceptionsForStatus404NotFound]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWorkspacesZapier([FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            return Ok(await uow.Workspace.GetZapierWorkspacesAsync(this.CurrentCompanyId));
        }

        #endregion

        #region HTTP POST

        [HttpPost("tasks")]
        [ValidateModel]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostTask([FromBody] CtcTaskZapierRequest request, [FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            if (string.IsNullOrEmpty(request.UserEmail))
                return BadRequest(new { Id = 6, Text = $"O seu e-mail é obrigatório" });

            if (string.IsNullOrEmpty(request.Title))
                return BadRequest(new { Id = 7, Text = $"O título é obrigatório" });

            if (!(request.WorkspaceId > 0))
                return BadRequest(new { Id = 7, Text = $"O Id da workspace é obrigatório" });

            if (!(request.CtcTaskTypeId > 0))
                return BadRequest(new { Id = 8, Text = $"O Id do tipo de tarefa é obrigatório" });

            if (!request.CurrentDueDate.HasValue)
                return BadRequest(new { Id = 7, Text = $"O campo \"Concluir até\" é obrigatório" });


            // Busca a empresa
            var company = await uow.Companies.GetIQueryable().Where(c => c.Id == auth.CompanyId).FirstOrDefaultAsync();
            if (company == null)
                return NotFound(new { Id = 10, Text = "Empresa não encontrada" });

            var currentUser = await uow.Users.GetIQueryable()
                .AsNoTracking()
                .Where(u => u.Email == request.UserEmail)
                .FirstOrDefaultAsync();

            if (currentUser == null)
                return BadRequest(new { Id = 10, Text = $"Usuário {request.UserEmail} não foi encontrado." });

            var currentUserCompany = await uow.UserCompany.GetIQueryable()
                .AsNoTracking()
                .Where(u => u.UserId == currentUser.Id)
                .FirstOrDefaultAsync();

            if (currentUserCompany == null)
                return BadRequest(new { Id = 15, Text = $"Usuário {request.UserEmail} não possui acesso a empresa." });


            if (CurrentAllowCreateTask == TaskDateEditPermission.AdminAndCreatorOnly)
            {
                if (currentUser.AdminEkyte == NoOrYes.No && currentUserCompany.ProfileCompany != ProfilesCompany.AdminOwner)
                    return BadRequest(new { Id = 20, Text = "Tarefa não foi criada. Usuário Editor sem permissão para criar tarefa." });
            }

            var result = await userAccessService.CheckAccessWorkspace(CurrentCompanyId, request.WorkspaceId, currentUser.Id);
            if (result.StatusCode != 200)
                return result;

            if (request.CtcTaskProjectId.HasValue)
            {
                var project = await uow.CtcTaskProject.GetIQueryable().FirstOrDefaultAsync(c => c.Id == request.CtcTaskProjectId && c.WorkspaceId == request.WorkspaceId);
                if (project == null)
                    return BadRequest(new { Id = 95, Text = "Projeto não encontrado para o id de Workspace informado." });
            }

            if (request.PlanTask == false && !request.CtcTaskProjectId.HasValue)
                return BadRequest(new { Id = 95, Text = "Para tarefas não planejadas é necessário informar o id do projeto." });

            var workspace = await uow.Workspace.GetIQueryable().AsNoTracking().Include(w => w.Tags).Where(w => w.Id == request.WorkspaceId).FirstOrDefaultAsync();
            if (workspace == null)
                return BadRequest(new { Id = 30, Text = "Workspace não encontrada" });

            var ctcTaskType = await uow.CtcTaskType.GetIQueryable()
                .AsNoTracking()
                .AsSplitQuery()
                .Include(t => t.Tags)
                .Include(t => t.Medias)
                .Include(t => t.FlowPhases.OrderBy(c => c.Sequential))
                .ThenInclude(c => c.Phase)
                .Include(c => c.CtcTaskTypeForms.Where(f => !f.Form.DeletedIn.HasValue && f.Form.Active == NoOrYes.Yes))
                .Where(c => c.Id == request.CtcTaskTypeId)
                .FirstOrDefaultAsync();

            if (ctcTaskType == null)
                return BadRequest(new { Id = 30, Text = "Tipo de tarefa não encontrado" });

            var companyWorkDays = (await uow.Companies.GetCompanyWorkDays(CurrentCompanyId)).ToList();
            var currentProject = await uow.CtcTaskProject.GetIQueryable().FirstOrDefaultAsync(c => c.Id == request.CtcTaskProjectId);

            // Cria tarefa não planejada para projeto
            if (request.PlanTask == false)
            {
                var removeProjectStartDate = false;

                var newTask = new CtcTaskProjectTasks();
                newTask.Id = 0;
                newTask.CreatedBy = null;
                newTask.HourlyRate = null;
                newTask.Title = request.Title;
                newTask.HourlyRateOrigin = null;
                newTask.CreatedAt = DateTime.Now;
                newTask.CreatedById = currentUser.Id;
                newTask.Flow = new List<CtcTaskProjectTaskFlow>();
                newTask.CtcTaskProjectId = request.CtcTaskProjectId.Value;

                //tasktype
                var idTaskType = request.CtcTaskTypeId.Value.ToString();
                CtcTaskType taskType = null;

                var idTaskTypeIsNumber = int.TryParse(idTaskType, out int idTaskTypeNumber);
                if (!idTaskTypeIsNumber)
                    return BadRequest(new { Id = 25, Text = "O id do tipo de tarefa é obrigatório." });
                else
                {
                    taskType = await uow.CtcTaskType.GetIQueryable().AsNoTracking().FirstOrDefaultAsync(c => (c.CompanyId == this.CurrentCompanyId || (this.CurrentHeadquarterId.HasValue && c.CompanyId == this.CurrentHeadquarterId && c.Workflow.Shared == NoOrYes.Yes) || c.CompanyId == 1) && c.Id == idTaskTypeNumber && !c.DeletedIn.HasValue);
                    if (taskType == null)
                        return BadRequest(new { Id = 30, Text = "O tipo de tarefa não foi encontrado." });
                    else
                        newTask.CtcTaskTypeId = taskType.Id;
                }

                if (taskType != null)
                {
                    //Datas e esforços para ágil
                    if (taskType.AllocationType == AllocationTypes.Agile)
                    {
                        newTask.AllocationType = taskType.AllocationType;

                        var startDate = request.PhaseStartDate.ToString();
                        var startDateIsValid = false;
                        DateTime? currentStartDate = null;

                        var endDate = request.CurrentDueDate.ToString();
                        DateTime? currentEndDate = null;

                        //start
                        if (!string.IsNullOrEmpty(startDate))
                        {
                            currentStartDate = request.PhaseStartDate.Value.Date.GetWorkDate(companyWorkDays).Date;

                            // Modelo de projeto não tem data, usa a data da primeira tarefa.
                            if (!currentProject.StartDate.HasValue)
                            {
                                currentProject.StartDate = currentStartDate;
                                removeProjectStartDate = true;
                            }

                            newTask.DaysToStart = currentProject.StartDate.HasValue ? currentProject.StartDate.Value.Date.GetWorkDate(companyWorkDays).GetWorkDays(currentStartDate.Value, companyWorkDays) : 0;

                            // Não colocou data final, calcula auto
                            if (string.IsNullOrEmpty(endDate))
                            {
                                currentEndDate = currentStartDate.Value.AddWorkDays(taskType.DaysToStart, companyWorkDays).Date;
                                var daysToComplete = currentStartDate.HasValue ? currentStartDate.Value.GetWorkDate(companyWorkDays).GetWorkDays(currentEndDate.Value, companyWorkDays) : 0;
                                newTask.DaysToComplete = daysToComplete < 0 ? 0 : daysToComplete;
                            }
                        }

                        //end
                        if (!currentEndDate.HasValue)
                        {
                            if (!string.IsNullOrEmpty(endDate))
                            {
                                currentEndDate = request.CurrentDueDate.Value.Date.Date.GetWorkDate(companyWorkDays).Date;

                                // Não colocou data de inicio mas tem a final, calcula.
                                if (!currentStartDate.HasValue)
                                {
                                    currentStartDate = currentEndDate.Value.SubtractWorkDays(taskType.DaysToStart, companyWorkDays);

                                    // Modelo de projeto não tem data, usa a data da primeira tarefa.
                                    if (!currentProject.StartDate.HasValue)
                                    {
                                        currentProject.StartDate = currentStartDate;
                                        removeProjectStartDate = true;
                                    }

                                    newTask.DaysToStart = currentProject.StartDate.HasValue ? currentProject.StartDate.Value.Date.GetWorkDate(companyWorkDays).GetWorkDays(currentStartDate.Value.Date, companyWorkDays) : 0;
                                }

                                var daysToComplete = currentStartDate.HasValue ? currentStartDate.Value.Date.GetWorkDate(companyWorkDays).GetWorkDays(currentEndDate.Value, companyWorkDays) : 0;
                                newTask.DaysToComplete = daysToComplete < 0 ? 0 : daysToComplete;
                            }
                        }

                        if (!currentStartDate.HasValue)
                            return BadRequest(new { Id = 45, Text = "A data de início é obrigatória." });

                        if (!currentEndDate.HasValue)
                            return BadRequest(new { Id = 50, Text = "A data de entrega é obrigatória." });

                        //effort
                        var effort = request.EstimatedTime.ToString();
                        var effortIsNumber = int.TryParse(effort, out int effortNumber);
                        if (effortIsNumber)
                            newTask.Effort = effortNumber;
                        else
                        {
                            if (taskType == null)
                                return BadRequest(new { Id = 90, Text = "Não foi possível encontrar o esforço previsto, utilize um tipo de tarefa válido." });
                            else
                                newTask.Effort = taskType.Effort;
                        }
                    }
                    // Datas e esforço para workload
                    else if (taskType.AllocationType == AllocationTypes.Workload)
                    {
                        newTask.AllocationType = taskType.AllocationType;

                        // Esforço
                        newTask.Effort = taskType.Effort;

                        var startDate = request.PhaseStartDate.ToString();
                        DateTime? currentStartDate = null;

                        var endDate = request.CurrentDueDate.ToString();
                        DateTime? currentEndDate = null;

                        // Data entrega
                        if (!string.IsNullOrEmpty(endDate))
                        {
                            currentEndDate = request.CurrentDueDate.Value.Date.GetWorkDate(companyWorkDays).Date;
                            newTask.DaysToComplete = taskType.DaysToStart;

                            // Data início pela entrega
                            currentStartDate = currentEndDate.Value.SubtractWorkDays(newTask.DaysToComplete, companyWorkDays).Date;

                            // Modelo de projeto não tem data, usa a data da primeira tarefa.
                            if (!currentProject.StartDate.HasValue)
                            {
                                currentProject.StartDate = currentStartDate;
                                removeProjectStartDate = true;
                            }

                            newTask.DaysToStart = currentProject.StartDate.HasValue ? currentProject.StartDate.Value.Date.GetWorkDate(companyWorkDays).GetWorkDays(currentStartDate.Value, companyWorkDays) : 0;
                        }

                        // Data inicio - Se não tem entrega, calcula pelo inicio
                        if (!currentEndDate.HasValue)
                        {
                            if (!string.IsNullOrEmpty(startDate))
                            {
                                var startDateIsValid = DateTime.TryParseExact(startDate, "yyyy-MM-dd", null, DateTimeStyles.None, out DateTime startDateTime);
                                if (!startDateIsValid)
                                    return BadRequest(new { Id = 65, Text = "A data de início é inválida. Utilize o formato 'YYYY-MM-DD'" });
                                else
                                {
                                    currentStartDate = startDateTime.GetWorkDate(companyWorkDays).Date;

                                    // Modelo de projeto não tem data, usa a data da primeira tarefa.
                                    if (!currentProject.StartDate.HasValue)
                                    {
                                        currentProject.StartDate = currentStartDate;
                                        removeProjectStartDate = true;
                                    }

                                    newTask.DaysToStart = currentProject.StartDate.HasValue ? currentProject.StartDate.Value.Date.GetWorkDate(companyWorkDays).GetWorkDays(currentStartDate.Value, companyWorkDays) : 0;

                                    //Data final pelo início + tipo de tarefa
                                    currentEndDate = currentStartDate.Value.AddWorkDays(taskType.DaysToStart, companyWorkDays).Date;
                                    var daysToComplete = currentStartDate.Value.GetWorkDate(companyWorkDays).GetWorkDays(currentEndDate.Value, companyWorkDays);
                                    newTask.DaysToComplete = daysToComplete < 0 ? 0 : daysToComplete;
                                }
                            }
                        }


                        if (!currentEndDate.HasValue)
                            return BadRequest(new { Id = 70, Text = "A data de entrega é obrigatória." });

                        if (!currentStartDate.HasValue)
                            return BadRequest(new { Id = 75, Text = "A data de início é obrigatória." });
                    }

                    var mediaIds = await uow.CtcTaskTypeMedia.GetIQueryable().AsNoTracking().Where(c => c.TaskTypeId == taskType.Id).Select(c => c.MediaId).ToListAsync();
                    if (mediaIds.Count > 0)
                    {
                        foreach (var mediaId in mediaIds)
                        {
                            var adaptationChannel = await uow.Channel.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.WorkspaceId == currentProject.WorkspaceId && c.MediaId == mediaId).FirstOrDefaultAsync();
                            if (adaptationChannel != null && !newTask.CtcTaskProjectTaskChannels.Any(c => c.ChannelId == adaptationChannel.Id))
                                newTask.CtcTaskProjectTaskChannels.Add(new CtcTaskProjectTaskChannel(adaptationChannel.Id, newTask.Id));
                        }
                    }
                }

                if (taskType == null)
                    return BadRequest(new { Id = 80, Text = "Não foi possível gerar o fluxo da tarefa, utilize um tipo de tarefa válido." });
                else
                {
                    var ctcTaskTypeFlowPhases = await uow.CtcTaskTypeFlow.GetIQueryable().AsNoTracking().Include(c => c.Phase).Where(c => !c.DeletedIn.HasValue && c.TaskTypeId == newTask.CtcTaskTypeId).OrderBy(c => c.Sequential).ToListAsync();
                    var firstFlowPhaseUnplanned = ctcTaskTypeFlowPhases.FirstOrDefault(c => c.Active == NoOrYes.Yes);
                    var indexFirstFlowPhase = ctcTaskTypeFlowPhases.IndexOf(firstFlowPhaseUnplanned);

                    var companyOwnerId = await uow.Companies.GetIQueryable().AsNoTracking().Where(c => c.Id == CurrentCompanyId).Select(c => c.OwnerId).FirstOrDefaultAsync();

                    var isFirstPhase = true;
                    foreach (var flowPhase in ctcTaskTypeFlowPhases)
                    {
                        var newProjectTaskFlow = new CtcTaskProjectTaskFlow()
                        {
                            FirstPhase = flowPhase.FirstPhase,
                            LastPhase = flowPhase.LastPhase,
                            NextPhaseId = flowPhase.NextPhaseId,
                            PreviousPhaseId = flowPhase.PreviousPhaseId,
                            PhaseId = flowPhase.PhaseId,
                            CoPhaseId = flowPhase.CoPhaseId,
                            Sequential = flowPhase.Sequential,
                            TaskTypeId = newTask.CtcTaskTypeId,
                            Active = flowPhase.Active,
                            Duration = flowPhase.Duration,
                            Effort = flowPhase.Effort,
                            ExecutorId = flowPhase.ExecutorId,
                        };

                        if (currentProject.IsModel == NoOrYes.No && taskType.AllocationType == AllocationTypes.Workload && taskType.PhaseStartType == PhaseStartTypes.NextDayAfterPreviousPhase)
                        {
                            if (isFirstPhase && flowPhase.Active == NoOrYes.Yes)
                            {
                                newProjectTaskFlow.DaysToStart = 0;
                                isFirstPhase = false;
                            }
                            else
                                newProjectTaskFlow.DaysToStart = 1;
                        }

                        if (!string.IsNullOrEmpty(request.UserEmail) && currentUser != null)
                        {
                            if (newProjectTaskFlow.PhaseId == firstFlowPhaseUnplanned.PhaseId)
                                newProjectTaskFlow.ExecutorId = currentUser.Id;
                        }


                        if (string.IsNullOrEmpty(newProjectTaskFlow.ExecutorId))
                        {
                            var teamMemberTaskTypeFlowPhase = "";
                            teamMemberTaskTypeFlowPhase = await uow.TeamMember.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.CompanyId == CurrentCompanyId && c.PhaseId == flowPhase.PhaseId && c.WorkspaceId == currentProject.WorkspaceId).Select(c => c.UserId).FirstOrDefaultAsync();

                            if (string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                                teamMemberTaskTypeFlowPhase = await uow.TeamMember.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.CompanyId == CurrentCompanyId && c.PhaseId == flowPhase.PhaseId && !c.WorkspaceId.HasValue).Select(c => c.UserId).FirstOrDefaultAsync();
                            if (string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                                teamMemberTaskTypeFlowPhase = companyOwnerId;

                            if (!string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                                newProjectTaskFlow.ExecutorId = teamMemberTaskTypeFlowPhase;
                        }

                        newTask.Flow.Add(newProjectTaskFlow);
                    }
                }

                //priority
                var priority = request.PriorityGroup.ToString();
                var priorityIsNumber = int.TryParse(priority, out int priorityNumber);
                if (priorityIsNumber)
                {
                    if (priorityNumber >= 0 && priorityNumber <= 100)
                    {
                        newTask.PriorityGroup = priorityNumber;

                        if ((1 <= priorityNumber) && (25 >= priorityNumber))
                            newTask.Priority = Priorities.Low;
                        if ((26 <= priorityNumber) && (50 >= priorityNumber))
                            newTask.Priority = Priorities.Medium;
                        if ((51 <= priorityNumber) && (75 >= priorityNumber))
                            newTask.Priority = Priorities.High;
                        if ((76 <= priorityNumber) && (100 >= priorityNumber))
                            newTask.Priority = Priorities.Urgent;
                        if ((0 <= priorityNumber) && (0 >= priorityNumber))
                            newTask.Priority = Priorities.NotPrioritized;
                    }
                    else
                        return BadRequest(new { Id = 85, Text = "A prioridade é inválida. Utilize valores de 0 a 100." });
                }
                else
                {
                    newTask.PriorityGroup = 0;
                    newTask.Priority = Priorities.NotPrioritized;
                }

                //descrição
                var description = request.Description.ToString();
                if (!string.IsNullOrEmpty(description))
                    newTask.Description = description;
                else
                {
                    if (taskType == null)
                        return BadRequest(new { Id = 85, Text = "Não foi possível encontrar a descrição, utilize um tipo de tarefa válido." });
                    else
                        newTask.Description = taskType.Description;
                }

                if (removeProjectStartDate)
                    currentProject.StartDate = null;

                var quantity = request.Quantity;
                if (quantity != null)
                {
                    var quantityText = quantity.ToString();
                    if (!string.IsNullOrEmpty(quantityText))
                    {
                        if (int.TryParse(quantityText, out int quantityNumber))
                            newTask.Quantity = quantityNumber;
                        else
                            return BadRequest(new { Id = 85, Text = "A quantidade é inválida. Utilize valores númericos." });
                    }
                }

                uow.CtcTaskProjectTasks.Create(newTask);

                projectService.GenerateNewProjectTaskHistory(currentProject, newTask, currentUser.Id);

                await uow.CommitAsync();

                return Ok(new { TaskId = newTask.Id });
            }

            // Cria tarefa padrão
            var task = new CtcTask()
            {
                Title = request.Title,
                Quantity = request.Quantity,
                EstimatedTime = ctcTaskType.AllocationType == AllocationTypes.Workload ? ctcTaskType.Effort : request.EstimatedTime,
                CtcTaskTypeId = ctcTaskType.Id,
                AllocationType = ctcTaskType.AllocationType,
                CurrentDueDate = request.CurrentDueDate,
                OriginalDueDate = request.CurrentDueDate,
                WorkspaceId = request.WorkspaceId,
                CreateById = currentUser.Id,
                CompanyId = CurrentCompanyId,
                Situation = TaskSituations.Active,
                PriorityGroup = request.PriorityGroup,
                CreationDate = DateTime.Now,
                CtcTaskProjectId = request.CtcTaskProjectId,
            };

            // Registra se tem gestão financeira
            if (CurrentActiveFinancialManagement == NoOrYes.Yes && task.AllocationType == AllocationTypes.Agile)
            {
                if (currentProject?.BudgetCalculationMethod == BudgetCalculationMethods.InformedInTheProject)
                {
                    task.HourlyBudget = currentProject.HourlyBudget;
                    task.HourlyRate = currentProject.HourlyBudget;
                    task.HourlyRateOrigin = HourlyRateOrigins.HourlyRateInformedInTheProject;
                }
                else
                {
                    task.HourlyRate = CurrentCompanyHourlyRateUser;
                    task.HourlyRateOrigin = HourlyRateOrigins.CompanyHourlyRate;
                }
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                if (!string.IsNullOrEmpty(request.Description))
                {
                    var processedDescription = request.Description
                        .Replace("<p>", "")
                        .Replace("</p>", "\n")
                        .Trim();

                    var lines = processedDescription.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
                    var formattedLines = lines.Select(line => string.IsNullOrWhiteSpace(line) ? "<div><br></div>" : $"<div>{line.Trim()}</div>");
                    task.Description = string.Join("", formattedLines);
                }

                else
                    task.Description = "<div>" + request.Description + "</div>";
            }

            if ((1 <= task.PriorityGroup) && (25 >= task.PriorityGroup))
                task.Priority = Priorities.Low;
            if ((26 <= task.PriorityGroup) && (50 >= task.PriorityGroup))
                task.Priority = Priorities.Medium;
            if ((51 <= task.PriorityGroup) && (75 >= task.PriorityGroup))
                task.Priority = Priorities.High;
            if ((76 <= task.PriorityGroup) && (100 >= task.PriorityGroup))
                task.Priority = Priorities.Urgent;
            if ((0 <= task.PriorityGroup) && (0 >= task.PriorityGroup))
                task.Priority = Priorities.NotPrioritized;

            // Canais
            if (ctcTaskType.Medias.Count > 0)
            {
                foreach (var media in ctcTaskType.Medias)
                {
                    var adaptationChannel = await uow.Channel.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.WorkspaceId == task.WorkspaceId && c.MediaId == media.MediaId).FirstOrDefaultAsync();
                    if (adaptationChannel != null && !task.CtcTaskChannels.Any(c => c.ChannelId == adaptationChannel.Id))
                        task.CtcTaskChannels.Add(new CtcTaskChannel(adaptationChannel.Id, task.Id));
                }
            }

            // Trata o fluxo do tipo
            var orderedFlowPhases = ctcTaskType.FlowPhases.Where(x => x.Active == NoOrYes.Yes).OrderBy(c => c.Sequential).ToList();
            var totalDuration = ctcTaskType.FlowPhases.Where(f => !f.DeletedIn.HasValue && f.Active == NoOrYes.Yes).Sum(f => f.Duration);
            var startDateFluxo = task.CurrentDueDate.Value.SubtractWorkDays(totalDuration, companyWorkDays);

            foreach (var flowPhase in ctcTaskType.FlowPhases.Where(x => x.Active == NoOrYes.Yes).OrderBy(c => c.Sequential))
            {
                var taskFlow = new CtcTaskFlow()
                {
                    FirstPhase = flowPhase.FirstPhase,
                    LastPhase = flowPhase.LastPhase,
                    NextPhaseId = flowPhase.NextPhaseId,
                    PreviousPhaseId = flowPhase.PreviousPhaseId,
                    PhaseId = flowPhase.PhaseId,
                    CoPhaseId = flowPhase.CoPhaseId,
                    Sequential = flowPhase.Sequential,
                    TaskTypeId = ctcTaskType.Id,
                    ExecutorId = flowPhase.ExecutorId,
                };

                if (task.AllocationType == AllocationTypes.Workload)
                {
                    var index = orderedFlowPhases.IndexOf(flowPhase);
                    var totalPreviousDuration = orderedFlowPhases.Where((f, i) => i < index && f.Active == NoOrYes.Yes).Sum(a => a.Duration);

                    taskFlow.Effort = flowPhase.Effort > 0 ? flowPhase.Effort : 60;
                    taskFlow.PhaseStartDate = startDateFluxo.AddWorkDays(totalPreviousDuration, companyWorkDays);
                    taskFlow.PhaseDueDate = startDateFluxo.AddWorkDays(totalPreviousDuration + flowPhase.Duration, companyWorkDays);
                }

                if (string.IsNullOrEmpty(taskFlow.ExecutorId))
                {
                    string teamMemberTaskTypeFlowPhase = null;
                    teamMemberTaskTypeFlowPhase = await uow.TeamMember.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.CompanyId == CurrentCompanyId && c.PhaseId == flowPhase.PhaseId && c.WorkspaceId == task.WorkspaceId).Select(c => c.UserId).FirstOrDefaultAsync();

                    if (string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                        teamMemberTaskTypeFlowPhase = await uow.TeamMember.GetIQueryable().AsNoTracking().Where(c => !c.DeletedIn.HasValue && c.CompanyId == CurrentCompanyId && c.PhaseId == flowPhase.PhaseId && !c.WorkspaceId.HasValue).Select(c => c.UserId).FirstOrDefaultAsync();
                    if (string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                        teamMemberTaskTypeFlowPhase = CurrentCompanyOwnerId;

                    if (!string.IsNullOrEmpty(teamMemberTaskTypeFlowPhase))
                        taskFlow.ExecutorId = teamMemberTaskTypeFlowPhase;
                }

                if (CurrentActiveFinancialManagement == NoOrYes.Yes && task.AllocationType == AllocationTypes.Workload)
                {
                    if (currentProject?.BudgetCalculationMethod == BudgetCalculationMethods.InformedInTheProject)
                    {
                        taskFlow.HourlyRate = task.HourlyBudget;
                        taskFlow.HourlyRateOrigin = HourlyRateOrigins.HourlyRateInformedInTheProject;
                    }
                    else
                    {
                        var userCompanyHourlyRate = await uow.UserCompany.GetIQueryable().Where(uc => uc.UserId == taskFlow.ExecutorId && uc.CompanyId == CurrentCompanyId).Select(c => c.HourlyRate).FirstOrDefaultAsync();
                        if (userCompanyHourlyRate > 0)
                        {
                            taskFlow.HourlyRate = userCompanyHourlyRate;
                            taskFlow.HourlyRateOrigin = HourlyRateOrigins.UserHourlyRate;
                        }
                        else
                        {
                            taskFlow.HourlyRate = CurrentCompanyHourlyRateUser;
                            taskFlow.HourlyRateOrigin = HourlyRateOrigins.CompanyHourlyRate;
                        }
                    }
                }

                task.Flow.Add(taskFlow);
            }

            var firstFlowPhase = task.Flow.OrderBy(c => c.Sequential).FirstOrDefault();
            task.PhaseId = firstFlowPhase.PhaseId;
            task.ExecutorId = firstFlowPhase.ExecutorId;

            if (firstFlowPhase.CoPhaseId.HasValue)
            {
                var coFlowPhase = task.Flow.Where(c => c.PhaseId == firstFlowPhase.CoPhaseId).FirstOrDefault();
                task.CoPhaseId = coFlowPhase.PhaseId;
                task.CoExecutorId = coFlowPhase.ExecutorId;
            }

            if (task.AllocationType == AllocationTypes.Agile)
            {
                task.PhaseStartDate = task.CurrentDueDate.Value.SubtractWorkDays(ctcTaskType.DaysToStart, companyWorkDays);
                task.PhaseDueDate = task.PhaseStartDate;
            }
            else
            {
                task.Flow = taskFlowService.ResetCtcTaskFlowByDueDate(task.CurrentDueDate.Value, task.Flow.ToList(), companyWorkDays, company.DefaultPhaseEffort);
                task.EstimatedTime = task.Flow.Where(f => !f.DeletedIn.HasValue).Sum(fp => fp.Effort);

                var currentFlowPhase = task.Flow.FirstOrDefault(f => f.PhaseId == task.PhaseId);
                task.PhaseStartDate = currentFlowPhase.PhaseStartDate;
                task.PhaseDueDate = currentFlowPhase.PhaseDueDate;
            }

            if (ctcTaskType.CtcTaskTypeForms.Count > 0)
            {
                var hasPlanPaid = await uow.CompanySubscription.GetIQueryable().AnyAsync(c => !c.DeletedIn.HasValue && c.CompanyId == CurrentCompanyId && c.EkytePlanId != 3);

                foreach (var taskTypeForm in ctcTaskType.CtcTaskTypeForms)
                {
                    var form = await uow.Form.GetIQueryable().Where(c => c.Id == taskTypeForm.FormId).FirstOrDefaultAsync();
                    if (form == null)
                        return NotFound();

                    if (!hasPlanPaid && !form.IsFreeEkytePlan)
                        continue;

                    // Ignora formulário que for de matriz
                    if (!(form.CompanyId == CurrentCompanyId || form.CompanyId == 1))
                        continue;

                    var mediaFields = new List<long> { 301, 653 };
                    var fieldValue = new List<string>();
                    var mediaCheckbox = await uow.FormField.GetIQueryable().AsNoTracking().Where((f) => f.FormId == form.Id && mediaFields.Contains(f.Id)).FirstOrDefaultAsync();
                    if (mediaCheckbox != null)
                    {
                        var channelIds = task.CtcTaskChannels.Select(c => c.ChannelId).ToList();
                        var channels = await uow.Channel.GetIQueryable().AsNoTracking().Where(c => channelIds.Contains(c.Id)).ToListAsync();
                        var hasFacebook = channels.Any(c => c.MediaId == 22);
                        var hasInstagram = channels.Any(c => c.MediaId == 68);
                        var hasLinkedin = channels.Any(c => c.MediaId == 69);
                        if (hasFacebook && mediaCheckbox.Options.IndexOf("Facebook") > -1)
                            fieldValue.Add("Facebook");
                        if (hasInstagram && mediaCheckbox.Options.IndexOf("Instagram") > -1)
                            fieldValue.Add("Instagram");
                        if (hasLinkedin && mediaCheckbox.Options.IndexOf("Linkedin") > -1)
                            fieldValue.Add("Linkedin");
                    };

                    for (var i = 0; i < taskTypeForm.Amount; i++)
                    {
                        var newCtcTaskForm = new CtcTaskForm(task, form, currentUser.Id);
                        newCtcTaskForm.FormName = form.Name;

                        JObject formValues = JObject.Parse("{}");
                        if (mediaCheckbox != null && fieldValue.Count > 0)
                            formValues.Add(mediaCheckbox.Id.ToString(), JArray.FromObject(fieldValue));

                        var newValues = new
                        {
                            form = formValues,
                            formId = form.Id,
                            formName = form.Name,
                        };
                        newCtcTaskForm.Values = JsonConvert.SerializeObject(newValues);


                        if (!task.PlacementStartDate.HasValue && task.CurrentDueDate.HasValue)
                            task.PlacementStartDate = task.CurrentDueDate.Value.Date.AddHours(8);

                        newCtcTaskForm.PlacementStartDate = task.PlacementStartDate;
                        newCtcTaskForm.PlacementEndDate = task.PlacementEndDate;
                        newCtcTaskForm.SetPlacementEndDate = task.SetPlacementEndDate;

                        task.CtcTaskForms.Add(newCtcTaskForm);
                    }
                }
            }

            // Trata as tags
            foreach (var tag in workspace.Tags)
            {
                if (!task.Tags.Any(t => t.TagId == tag.Id))
                    task.Tags.Add(new CtcTaskTag(tag.Id, task.Id));
            }

            foreach (var tag in ctcTaskType.Tags)
            {
                if (!task.Tags.Any(t => t.TagId == tag.Id))
                    task.Tags.Add(new CtcTaskTag(tag.Id, task.Id));
            }

            // Trata os checklists
            var phaseIds = task.Flow.Select(f => f.PhaseId);
            var currentPhases = ctcTaskType.FlowPhases.Where(f => phaseIds.Contains(f.PhaseId) && f.ChecklistId.HasValue).ToList();
            var checklists = await uow.Checklist.GetCompleteActivesAsync(CurrentCompanyId, CurrentHeadquarterId, true);
            foreach (var fp in currentPhases)
            {
                var checklist = checklists.FirstOrDefault(c => c.Id == fp.ChecklistId);
                if (checklist != null)
                {
                    var newCtcTaskChecklist = new CtcTaskChecklist(checklist.Name, task.Id, fp.PhaseId, checklist.Id);
                    foreach (var ci in checklist.ChecklistItems)
                    {
                        var newCtcTaskChecklistItem = new CtcTaskChecklistItem();
                        newCtcTaskChecklistItem.Name = ci.Name;
                        newCtcTaskChecklistItem.Description = ci.Description;
                        newCtcTaskChecklistItem.Sequential = ci.Sequential;
                        newCtcTaskChecklist.CtcTaskChecklistItems.Add(newCtcTaskChecklistItem);
                    }
                    task.CtcTaskChecklists.Add(newCtcTaskChecklist);
                }
            }

            // Trata base64 da descrição
            task.Description = await artifactService.TaskArtifactAsync(task.Description, task, task.CreateById, ArtifactContexts.Task, await uow.Workspace.GetNotIncludeAsync(task.WorkspaceId), amazonS3FileService.UploadToSync);

            // Interação de criação tarefa
            var newInterationCreateBy = new CtcTaskIteration(task);
            newInterationCreateBy.CreateById = task.CreateById;
            newInterationCreateBy.Creation = task.CreationDate;
            task.Iterations.Add(newInterationCreateBy);

            // Interações para formulários
            foreach (var ctcTaskForm in task.CtcTaskForms)
                await taskIteration.GenerateIterationAsync(task, task, new CtcTaskIteration(task), currentUser.Id, "CtcTaskFormId", ctcTaskForm.Id.ToString(), null, $"Formulário \"{ctcTaskForm.FormName}\" ({ctcTaskForm.Id})");

            // Notificação tarefa
            await notificationService.AddNewTaskNotification(currentUser.Id, task, task.ExecutorId);

            await uow.CommitAsync();
            return Ok(new { TaskId = task.Id });
        }

        [HttpPost("tickets")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostTicket([FromBody] TicketZapierRequest request, [FromQuery] FilterToAuthZapier auth)
        {
            if (this.CurrentCompanyId != auth.CompanyId)
                return Unauthorized();

            if (string.IsNullOrEmpty(request.UserEmail))
                return BadRequest(new { Id = 6, Text = $"O seu e-mail é obrigatório" });

            if (!(request.WorkspaceId > 0))
                return BadRequest(new { Id = 6, Text = $"O Id da workspace é obrigatório" });

            if (!(request.TicketType > 0))
                return BadRequest(new { Id = 6, Text = $"O tipo de ocorrência é obrigatório" });

            if (string.IsNullOrEmpty(request.RequesterEmail))
                return BadRequest(new { Id = 6, Text = $"O e-mail do solicitante é obrigatório" });

            // Usuário que está criando
            var currentUser = await uow.Users.GetIQueryable()
               .AsNoTracking()
               .Where(u => u.Email == request.UserEmail)
               .FirstOrDefaultAsync();

            if (currentUser == null)
                return BadRequest(new { Id = 10, Text = $"Usuário {request.UserEmail} não foi encontrado." });

            var currentUserCompany = await uow.UserCompany.GetIQueryable()
                .AsNoTracking()
                .Where(u => u.UserId == currentUser.Id)
                .FirstOrDefaultAsync();

            if (currentUserCompany == null)
                return BadRequest(new { Id = 15, Text = $"Usuário {request.UserEmail} não possui acesso a empresa." });

            // Usuário solicitante
            var currentRequester = await uow.Users.GetIQueryable()
               .AsNoTracking()
               .Where(u => u.Email == request.RequesterEmail)
               .FirstOrDefaultAsync();

            if (currentRequester == null)
                return BadRequest(new { Id = 10, Text = $"Usuário {request.RequesterEmail} não foi encontrado." });

            var currentRequesterCompany = await uow.UserCompany.GetIQueryable().Where(u => u.UserId == currentRequester.Id).FirstOrDefaultAsync();
            if (currentRequesterCompany == null)
                currentRequester.AddCompany(CurrentCompanyId);

            // Emails de usuários em cópia
            if (!string.IsNullOrEmpty(request.UsersCC))
            {
                var usersCC = request.UsersCC.Split(",").ToList();
                if (usersCC.Count > 0)
                {
                    foreach (var userCc in usersCC)
                    {
                        // Trata usuário novo ou existente
                        var userEmail = userCc.TrimStart().TrimEnd().ToLower();
                        var currentUserCC = await userManager.FindByEmailAsync(userEmail);
                        if (currentUserCC == null) // Se usuário não existe, cria e relaciona a empresa
                        {
                            var newUser = new EkyteUser(userEmail, CurrentCompanyId, ProfilesCompany.Guest, NoOrYes.No, request.WorkspaceId, CurrentWorkflowId) { UserName = userEmail, Name = userEmail };

                            var routinesWithTour = await uow.Routine.GetIQueryable().Where(r => !string.IsNullOrEmpty(r.IntercomTourId)).Select(r => r.Id).ToListAsync();
                            if (routinesWithTour.Count > 0)
                                newUser.PendingTourRoutines = string.Join("|", routinesWithTour.Select(i => i.ToString()));

                            var usrResult = await userManager.CreateAsync(newUser, Config.DefaultPassword);
                            if (!usrResult.Succeeded)
                                return BadRequest();

                            currentUser = await uow.Users.GetIQueryable().Where(u => u.NormalizedEmail.ToLower() == userEmail).FirstOrDefaultAsync();
                        }
                        else
                        {
                            if (!currentUser.BelongsWithCompany(CurrentCompanyId)) // Se usuário existe e não esta na empresa, relaciona
                                currentUser.AddCompany(CurrentCompanyId, ProfilesCompany.Guest, NoOrYes.No, request.WorkspaceId, CurrentWorkflowId);
                        }

                        request.TicketCC.Add(new TicketCCRequest() { UserId = currentUser.Id, Email = currentUser.Email });
                    }
                }
            }

            // Valida se requester é usado por outra empresa
            if (currentRequester.Email.Contains("ekyte.com"))
            {
                var isTicketEmail = await uow.Companies.GetIQueryable().AnyAsync(c => EF.Functions.Like(currentRequester.Email, c.TicketEmail + "+%") || EF.Functions.Like(currentRequester.Email, c.TicketEmail + "@%"));
                if (isTicketEmail)
                    return new BadRequestObjectResult(new ValidationError("company", $"E-mail ({currentRequester.Email}) já utilizado por outra empresa, favor informar outro solicitante."));
            }

            // Usuários em cópia
            if (request.TicketCC != null)
            {
                foreach (var item in request.TicketCC)
                {
                    //valida se email é ekyte - se for passa reto
                    if (!string.IsNullOrEmpty(item.UserId))
                    {
                        var userCC = await uow.Users.GetIQueryable().Select(u => new { u.Id, u.Email }).FirstOrDefaultAsync(u => u.Id == item.UserId);
                        if (userCC.Email.Contains("ekyte.com"))
                        {
                            var isTicketEmail = await uow.Companies.GetIQueryable().AnyAsync(c => EF.Functions.Like(userCC.Email, c.TicketEmail + "+%") || EF.Functions.Like(userCC.Email, c.TicketEmail + "@%"));
                            if (isTicketEmail)
                                return new BadRequestObjectResult(new ValidationError("company", $"E-mail ({userCC.Email}) já utilizado por outra empresa, favor informar outro solicitante."));
                        }
                    }
                }
            };

            if (request.WorkspaceId.HasValue)
            {
                var result = await userAccessService.CheckAccessWorkspace(CurrentCompanyId, request.WorkspaceId.Value, currentUser.Id);
                if (result.StatusCode != 200)
                    return result;
            }

            var newTicket = new Ticket()
            {
                CompanyId = CurrentCompanyId,

                RequesterId = currentRequester.Id,
                Subject = request.Subject,
                FirstDueDate = request.ExpectDueDate,
                ExpectDueDate = request.ExpectDueDate,
                LastCommentIn = DateTime.Now,

                TicketStatus = TicketStatus.Processing,

                TicketSource = TicketSource.External,

                CreatedIn = DateTime.Now,
                CreatedById = currentUser.Id,
                Read = NoOrYes.No,
                RequesterRead = NoOrYes.No,
                TicketType = request.TicketType,
                Message = "<p>Aberto via integração zapier.</p>",
                Priority = Priorities.NotPrioritized,
                PriorityGroup = 0,
                TicketPhaseId = 1,

                WorkspaceId = request.WorkspaceId,
                ProjectId = request.ProjectId,
            };

            if (!string.IsNullOrEmpty(request.Message))
                newTicket.Message = "<div>" + request.Message + "</div>";

            if ((1 <= newTicket.PriorityGroup) && (25 >= newTicket.PriorityGroup))
                newTicket.Priority = Priorities.Low;
            if ((26 <= newTicket.PriorityGroup) && (50 >= newTicket.PriorityGroup))
                newTicket.Priority = Priorities.Medium;
            if ((51 <= newTicket.PriorityGroup) && (75 >= newTicket.PriorityGroup))
                newTicket.Priority = Priorities.High;
            if ((76 <= newTicket.PriorityGroup) && (100 >= newTicket.PriorityGroup))
                newTicket.Priority = Priorities.Urgent;
            if ((0 <= newTicket.PriorityGroup) && (0 >= newTicket.PriorityGroup))
                newTicket.Priority = Priorities.NotPrioritized;

            //Analista padrão 
            if (string.IsNullOrEmpty(newTicket.AnalystId))
            {
                var currentWorkspace = await uow.Workspace.GetTicketAnalystAsync((long)newTicket.WorkspaceId);
                if (currentWorkspace.TicketAnalyst != null)
                {
                    newTicket.AnalystId = currentWorkspace.TicketAnalystId;
                    newTicket.Analyst = currentWorkspace.TicketAnalyst;
                    newTicket.ExecutorId = currentWorkspace.TicketAnalystId;
                    newTicket.Executor = currentWorkspace.TicketAnalyst;
                }
            }

            if (string.IsNullOrEmpty(newTicket.AnalystId))
            {
                if (!string.IsNullOrEmpty(CurrentTicketAnalystId))
                {
                    var ticketAnalyst = await uow.Users.GetIQueryable().FirstOrDefaultAsync(u => u.Id == CurrentTicketAnalystId);
                    if (ticketAnalyst != null)
                    {
                        newTicket.AnalystId = ticketAnalyst.Id;
                        newTicket.Analyst = ticketAnalyst;
                        newTicket.ExecutorId = ticketAnalyst.Id;
                        newTicket.Executor = ticketAnalyst;
                    }
                }
            }

            if (string.IsNullOrEmpty(newTicket.AnalystId))
                newTicket.AnalystId = CurrentCompanyOwnerId;

            newTicket.ExecutorId = newTicket.AnalystId;
            newTicket.Executor = newTicket.Analyst;

            var userWorkflow = await uow.UserCompany.GetIQueryable().Where(uc => uc.CompanyId == CurrentCompanyId && uc.UserId == newTicket.AnalystId).Select(uc => uc.WorkflowId).FirstOrDefaultAsync();
            var workflow = await uow.Workflow.GetAsync(userWorkflow != null && userWorkflow.HasValue ? userWorkflow.Value : CurrentWorkflowId.Value);
            var queryTeamMembers = uow.TeamMember.GetIQueryable().AsNoTracking();
            if (workflow.Initial == NoOrYes.Yes)
                queryTeamMembers = queryTeamMembers.Where(c => (c.Phase.WorkflowId == workflow.Id || c.Phase.WorkflowId == 1));
            else
                queryTeamMembers = queryTeamMembers.Where(c => c.Phase.WorkflowId == workflow.Id);

            // Fluxo
            var phasesTicket = await uow.TicketPhase.GetAsyncActives();
            if (phasesTicket != null)
            {
                foreach (var phase in phasesTicket)
                {
                    var newTicketFlow = new TicketFlow();
                    newTicketFlow.ExecutorId = newTicket.AnalystId;
                    newTicketFlow.Sequential = phase.Sequential;
                    newTicketFlow.TicketPhaseId = phase.Id;
                    newTicket.Flow.Add(newTicketFlow);
                }
            }
            newTicket.Flow = ticketService.OrganizeFlow(newTicket.Flow);

            // Trata anexos na mensagem e cria o ticket.
            // Trata base64 da mensagem
            Workspace aWorkspace = null;
            if (newTicket.WorkspaceId.HasValue)
                aWorkspace = await uow.Workspace.GetNotIncludeAsync(newTicket.WorkspaceId.Value);
            if (aWorkspace == null)
                aWorkspace = await uow.Workspace.GetIQueryable().Where(w => !w.DeletedIn.HasValue && w.CompanyId == newTicket.CompanyId).FirstOrDefaultAsync();
            if (aWorkspace == null)
                aWorkspace = await uow.Workspace.GetIQueryable().Where(w => w.CompanyId == newTicket.CompanyId).FirstOrDefaultAsync();

            newTicket.Message = await artifactService.TicketMessageArtifactAsync(newTicket.Message, newTicket, currentUser.Id, ArtifactContexts.Ticket, aWorkspace, amazonS3FileService.UploadToSync);
            await uow.CommitAsync();

            // Gera historico criação
            ticketService.GenerateNewTicketHistory(newTicket, CurrentCompanyOwnerId);

            // Notificação executor
            await notificationTicketService.TicketNotification(newTicket.RequesterId, newTicket);

            await uow.CommitAsync();

            // Envia e-mail
            var ticket = await uow.Ticket.GetIQueryable()
                .AsNoTracking()
                .AsSplitQuery()
                .Include(t => t.Company)
                .Include(t => t.Workspace)
                .Include(t => t.Requester)
                .Include(t => t.TicketCC)
                    .ThenInclude(t => t.User)
                .Include(t => t.ArtifactRelationships)
                    .ThenInclude(t => t.Artifact.ArtifactsS3)
                .Include(t => t.ArtifactRelationships)
                    .ThenInclude(t => t.Artifact.Workspace)
                .Where(t => t.Id == newTicket.Id)
                .FirstOrDefaultAsync();

            var defaultLanguage = CurrentCompanyDefaultLanguage;
            if (ticket.WorkspaceId.HasValue)
                defaultLanguage = ticket.Workspace.DefaultLanguage;

            await emailService.SendNewTicketEmail(ticket, defaultLanguage, true);

            return Ok(new { TicketId = newTicket.Id });
        }

        [HttpPost("boards")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostBoard([FromBody] BoardZapierRequest request, [FromQuery] FilterToAuthZapier auth)
        {
            if (string.IsNullOrEmpty(request.Title))
                return BadRequest(new { Id = 1, Text = $"O título não pode ser nulo" });

            var currentUser = await userManager.FindByEmailAsync(auth.UserEmail);
            if (!currentUser.BelongsWithCompany(auth.CompanyId))
                return BadRequest(new { Id = 10, Text = $"O usuário {auth.UserEmail} não pertence a empresa {auth.CompanyId}" });

            var currentUserCompany = currentUser.UserCompanies.Where(u => u.CompanyId == auth.CompanyId).FirstOrDefault();

            long? workspaceId = null;
            workspaceId = request.WorkspaceId;
            if (!workspaceId.HasValue)
                workspaceId = currentUserCompany.WorkspaceId;
            if (!workspaceId.HasValue)
                workspaceId = await uow.Workspace.GetIQueryable().Where(w => !w.DeletedIn.HasValue && w.CompanyId == auth.CompanyId).Select(t => t.Id).FirstOrDefaultAsync();
            if (!workspaceId.HasValue)
                workspaceId = await uow.Workspace.GetIQueryable().Where(w => w.CompanyId == auth.CompanyId).Select(t => t.Id).FirstOrDefaultAsync();

            if (!workspaceId.HasValue)
                return NotFound(new { Id = 40, Text = "Workspace não encontrada" });

            if (workspaceId.HasValue)
            {
                if (!await uow.Workspace.GetIQueryable().AnyAsync(w => w.Id == workspaceId && w.CompanyId == auth.CompanyId && w.Active == NoOrYes.Yes))
                    return NotFound(new { Id = 41, Text = $"Workspace ({workspaceId.Value}) não pertence a empresa ({auth.CompanyId}) ou está inativa." });
            }

            var newBoard = mapper.Map<Plan>(request);
            newBoard.Active = NoOrYes.Yes;
            newBoard.StartDate = DateTime.Now;
            newBoard.CreatedBy = currentUser;
            newBoard.CreatedById = currentUser.Id;
            newBoard.WorkspaceId = workspaceId.Value;
            newBoard.Description = await artifactService.BoardMessageArtifactAsync(request.Description, newBoard, newBoard.CreatedById, ArtifactContexts.Plan, await uow.Workspace.GetNotIncludeAsync(newBoard.WorkspaceId), amazonS3FileService.UploadToSync);

            uow.Plan.Create(newBoard);
            await uow.CommitAsync();
            return Ok(new { BoardId = newBoard.Id });
        }

        [HttpPost("notes")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostNote([FromBody] NoteZapierRequest request, [FromQuery] FilterToAuthZapier auth)
        {
            var currentBoard = await uow.Plan.GetIQueryable().AsNoTracking().Where(p => p.Workspace.CompanyWorkspaces.Any(cw => cw.CompanyId == auth.CompanyId || cw.CompanyId == 1 || (CurrentHeadquarterId.HasValue && cw.CompanyId == CurrentHeadquarterId)) && p.Id == request.PlanId).Select(c => new { c.Id, c.WorkspaceId, c.Workspace.CompanyId, CompanyType = c.Workspace.Company.Type, Categories = c.Categories }).FirstOrDefaultAsync();
            if (currentBoard is null)
                return NotFound();

            var currentUser = await userManager.FindByEmailAsync(auth.UserEmail);
            if (!currentUser.BelongsWithCompany(auth.CompanyId))
                return BadRequest(new { Id = 20, Text = $"O usuário {auth.UserEmail} não pertence a empresa {auth.CompanyId}" });

            var newNote = new PlanFields();
            newNote.CreatedById = currentUser.Id;
            newNote.Active = PlanFieldSituation.Active;
            newNote.Title = request.Title;
            newNote.PlanId = request.PlanId;
            newNote.Content = await artifactService.NoteMessageArtifactAsync(request.Content, newNote, currentUser.Id, ArtifactContexts.PlanField, await uow.Workspace.GetNotIncludeAsync(currentBoard.WorkspaceId), amazonS3FileService.UploadToSync);
            newNote.Description = request.Description;

            var currentCategory = currentBoard.Categories.FirstOrDefault(c => c.Title.RemoveAccentsWhiteSpacesToLower() == request.Category.RemoveAccentsWhiteSpacesToLower());
            if (currentCategory is not null)
                newNote.CategoryId = currentCategory.Id;
            else
            {
                var lastSequential = await uow.PlanCategories.GetIQueryable().Where(c => c.PlanId == request.PlanId).MaxAsync(c => (int?)c.Sequential);
                var newCategory = new PlanCategories();

                newCategory.Title = request.Category;
                newCategory.PlanId = request.PlanId;
                newCategory.PlanFields.Add(newNote);
                newCategory.Sequential = (lastSequential.HasValue ? lastSequential.Value : 0) + 1;
                newNote.CategoryId = newCategory.Id;

                await uow.PlanCategories.CreateAsync(newCategory);
            }

            await uow.PlanFields.CreateAsync(newNote);
            await uow.CommitAsync();
            return Ok(new { NoteId = newNote.Id });
        }


        [HttpPost("projects")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostProject([FromBody] ProjectZapierRequest request, [FromQuery] FilterToAuthZapier auth)
        {
            //Validação do nome
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { Id = 1, Text = $"O título do projeto não pode ser nulo" });

            var currentUser = await userManager.FindByEmailAsync(auth.UserEmail);
            if (!currentUser.BelongsWithCompany(auth.CompanyId))
                return BadRequest(new { Id = 10, Text = $"O usuário {auth.UserEmail} não pertence a empresa {auth.CompanyId}" });

            if (!string.IsNullOrWhiteSpace(request.Alias))
            {
                if (request.Alias.Length > 15)
                    return BadRequest(new { Id = 1, Text = $"O alias / identificação do projeto não pode ser maior que 15 caracteres." });
            }

            var currentUserCompany = currentUser.UserCompanies.Where(u => u.CompanyId == auth.CompanyId).FirstOrDefault();

            long? workspaceId = null;
            workspaceId = request.WorkspaceId;
            if (!workspaceId.HasValue)
                workspaceId = currentUserCompany.WorkspaceId;
            if (!workspaceId.HasValue)
                workspaceId = await uow.Workspace.GetIQueryable().Where(w => !w.DeletedIn.HasValue && w.CompanyId == auth.CompanyId).Select(t => t.Id).FirstOrDefaultAsync();
            if (!workspaceId.HasValue)
                workspaceId = await uow.Workspace.GetIQueryable().Where(w => w.CompanyId == auth.CompanyId).Select(t => t.Id).FirstOrDefaultAsync();

            if (!workspaceId.HasValue)
                return NotFound(new { Id = 40, Text = "Workspace não encontrada" });

            if (workspaceId.HasValue)
            {
                if (!await uow.Workspace.GetIQueryable().AnyAsync(w => w.Id == workspaceId && w.CompanyId == auth.CompanyId && w.Active == NoOrYes.Yes))
                    return NotFound(new { Id = 41, Text = $"Workspace ({workspaceId.Value}) não pertence a empresa ({auth.CompanyId}) ou está inativa." });
            }

            var tags = new List<Tag>();
            if (!string.IsNullOrWhiteSpace(request.Tags))
            {
                var list = request.Tags.Trim().Split('|').ToList();

                foreach (var tagName in list)
                {
                    var tagByGet = await uow.Tag.GetTagByNameAndTypeAsync(auth.CompanyId, tagName, TagTypes.Project);
                    if (tagByGet != null)
                        tags.Add(tagByGet);
                    else
                    {
                        var newTag = new Tag(tagName, auth.CompanyId, TagTypes.Project);
                        await uow.Tag.CreateAsync(newTag);
                        await uow.CommitAsync();
                        tags.Add(newTag);
                    }
                }
            }

            var alias = !string.IsNullOrWhiteSpace(request.Alias) ? request.Alias : request.Name.Substring(0, 14).Trim().ToLower();
            alias = Regex.Replace(alias, @"\s+", "-");

            var newProject = new CtcTaskProject()
            {
                Name = request.Name,
                Alias = alias,
                CreatedBy = currentUser,
                CreatedById = currentUser.Id,
                Description = request.Description,
                WorkspaceId = workspaceId.Value,
                StartDate = request.StartDate.HasValue ? request.StartDate.Value : DateTime.Now,
                Tags = tags
            };

            uow.CtcTaskProject.Create(newProject);
            projectService.GenerateNewProjectHistory(newProject, currentUser.Id);
            await uow.CommitAsync();

            return Ok(new { ProjectId = newProject.Id });
        }

        [HttpPost("workspaces")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> PostWorkspace([FromBody] WorkspaceZapierRequest workspace, [FromQuery] FilterToAuthZapier auth)
        {
            var company = await uow.Companies.GetIQueryable().FirstOrDefaultAsync(c => c.Id == auth.CompanyId);
            if (company == null)
                return NotFound();

            var currentUser = await uow.Users.GetIQueryable().AsNoTracking().Where(u => u.Email == auth.UserEmail).FirstOrDefaultAsync();
            if (currentUser == null)
                return BadRequest(new { Id = 10, Text = $"Usuário {auth.UserEmail} não foi encontrado." });

            var currentUserCompany = await uow.UserCompany.GetIQueryable().AsNoTracking().Where(u => u.UserId == currentUser.Id && u.CompanyId == auth.CompanyId).FirstOrDefaultAsync();
            if (currentUserCompany == null)
                return BadRequest(new { Id = 15, Text = $"Usuário {auth.UserEmail} não possui acesso a empresa." });

            if (currentUser.AdminEkyte == NoOrYes.No && currentUserCompany.ProfileCompany != ProfilesCompany.AdminOwner)
                return BadRequest(new { Id = 20, Text = "Workspace não foi criada. Usuário sem permissão para criar workspace." });

            var newWorkspace = new Workspace();
            if (company.TeamProfile == TeamProfile.MarketingAgency)
            {
                var defaultWorkspace = await uow.Workspace.GetAsyncWorkspaceDefault();
                newWorkspace = workspaceDuplicateService.CopyDefault(company.Type, defaultWorkspace);
                mapper.Map(workspace, newWorkspace);
            }
            else
                newWorkspace = mapper.Map<Workspace>(workspace);

            newWorkspace.Company = company;
            newWorkspace.CompanyId = company.Id;
            newWorkspace.DefaultLanguage = company.DefaultLanguage;

            if (company.EnableGenAi == NoOrYes.Yes)
                newWorkspace.EnableGenAi = NoOrYes.Yes;
            else
                newWorkspace.EnableGenAi = NoOrYes.No;

            if (workspace.SquadId.HasValue)
            {
                var squad = await uow.Squad.GetIQueryable().Where(c => !c.DeletedIn.HasValue && c.CompanyId == auth.CompanyId && c.Id == workspace.SquadId).FirstOrDefaultAsync();
                if (squad != null)
                {
                    newWorkspace.SquadId = squad.Id;
                    newWorkspace.Squad = squad;
                }
                else
                    return NotFound(new { Id = 40, Text = "Squad não encontrado" });
            }

            if (workspace.Companies != null)
            {
                foreach (var currentCompany in workspace.Companies)
                {
                    if (!newWorkspace.CompanyWorkspaces.Any(ppf => ppf.CompanyId == currentCompany.Id))
                    {
                        var existsCompany = await uow.Companies.GetIQueryable().AnyAsync(c => c.Id == currentCompany.Id);
                        if (existsCompany)
                            newWorkspace.CompanyWorkspaces.Add(new CompanyWorkspaces(currentCompany.Id, workspace.Id, currentCompany.Active));
                    }
                }
            }

            var companyWorkspaceOwner = newWorkspace.CompanyWorkspaces.FirstOrDefault(cw => cw.CompanyId == workspace.CompanyId && cw.WorkspaceId == workspace.Id);
            if (companyWorkspaceOwner == null)
                newWorkspace.CompanyWorkspaces.Add(new CompanyWorkspaces(auth.CompanyId, workspace.Id, NoOrYes.Yes));

            uow.Workspace.Create(newWorkspace);
            await uow.CommitAsync();

            return Ok(new { WorkspaceId = newWorkspace.Id });
        }

        #endregion
    }
}