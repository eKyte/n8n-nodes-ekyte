using Applications.Web.Models.Templates;
using Domain.Entities.Workspaces.Tasks;
using Domain.ValueObject.Enums;
using System;
using System.Runtime.Serialization;

namespace Applications.Web.Models.Request
{
    [DataContract]
    public class CtcTaskZapierRequest : ModelToDomainProfile
    {
        public CtcTaskZapierRequest()
        {
            CreateMap<CtcTaskZapierRequest, CtcTask>();
            CreateMap<CtcTask, CtcTaskZapierRequest>()
                .ForMember(c => c.UserEmail, a => a.Ignore());
        }

        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public long PriorityGroup { get; set; } = 0;

        [DataMember]
        public int? Quantity { get; set; }

        [DataMember]
        public long? EstimatedTime { get; set; } = 0;

        [DataMember]
        public DateTime? CurrentDueDate { get; set; }

        [DataMember]
        public long? CtcTaskTypeId { get; set; }

        [DataMember]
        public long WorkspaceId { get; set; }

        [DataMember]
        public long? CtcTaskProjectId { get; set; }

        [DataMember]
        public string UserEmail { get; set; }

        [DataMember]
        public bool? PlanTask { get; set; } = true;

        [DataMember]
        public DateTime? PhaseStartDate { get; set; }
    }
}