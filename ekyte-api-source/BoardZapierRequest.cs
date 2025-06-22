using Applications.Web.Models.Templates;
using Domain.Entities.Workspaces.Plans;
using System.Runtime.Serialization;

namespace Applications.Web.Models.Request
{
    public class BoardZapierRequest : ModelToDomainProfile
    {

        public BoardZapierRequest()
        {
            CreateMap<BoardZapierRequest, Plan>()
                .ForMember(c => c.Workspace, a => a.Ignore())
                .ForMember(c => c.IsTemplate, a => a.Ignore())
                .ForMember(c => c.Active, a => a.Ignore())
                .ForMember(c => c.IsFavorite, a => a.Ignore())
                .ForMember(c => c.CreatedBy, a => a.Ignore())
                .ForMember(c => c.CreatedById, a => a.Ignore())
                .ForMember(c => c.AvatarId, a => a.Ignore())
                .ForMember(c => c.Avatar, a => a.Ignore())
                .ForMember(c => c.CreatedIn, a => a.Ignore())
                .ForMember(c => c.StartDate, a => a.Ignore())
                .ForMember(c => c.EndDate, a => a.Ignore())
                .ForMember(c => c.Fields, a => a.Ignore())
                .ForMember(c => c.Categories, a => a.Ignore())
                .ForMember(c => c.ArtifactRelationships, a => a.Ignore())
                .ForMember(c => c.DeletedIn, a => a.Ignore())
                .ForMember(c => c.Id, a => a.Ignore());
        }

        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public long WorkspaceId { get; set; }
    }
}
